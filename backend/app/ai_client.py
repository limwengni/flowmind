import json
import logging
import os
import re
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

CHUTES_MODEL = "Qwen/Qwen3.6-27B-TEE"
OPENAI_MODEL = "gpt-4o-mini"
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class PipelineAPIError(Exception):
    def __init__(self, status_code: int, message: str, provider: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.provider = provider


def active_provider() -> str:
    return os.getenv("AI_PROVIDER", "chutes").strip().lower()


def requires_user_token() -> bool:
    return active_provider() == "chutes"


def _provider_config(provider: str, user_access_token: Optional[str]) -> tuple[str, str, str]:
    if provider == "chutes":
        if not user_access_token:
            raise PipelineAPIError(401, "Missing Chutes user session.", provider)
        return (
            os.getenv("CHUTES_LLM_BASE", "https://llm.chutes.ai/v1"),
            user_access_token,
            os.getenv("FLOWMIND_MODEL", CHUTES_MODEL),
        )

    if provider in {"openai_compatible", "openrouter", "groq"}:
        api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise PipelineAPIError(500, "AI_API_KEY is not configured.", provider)
        return (
            os.getenv("AI_BASE_URL", os.getenv("OPENAI_BASE_URL", "")).rstrip("/"),
            api_key,
            os.getenv("FLOWMIND_MODEL", OPENAI_MODEL),
        )

    raise PipelineAPIError(500, f"Unknown AI_PROVIDER: {provider}", provider)


def chat(
    messages: list,
    user_access_token: Optional[str] = None,
    max_tokens: int = 1024,
    temperature: float = 0.3,
) -> str:
    provider = active_provider()
    if provider == "mock":
        return json.dumps(_mock_json(messages))

    base_url, api_key, model = _provider_config(provider, user_access_token)
    if not base_url:
        raise PipelineAPIError(500, "AI base URL is not configured.", provider)

    request_json = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
        "think": False,
    }
    if "localhost:11434" in base_url or "127.0.0.1:11434" in base_url:
        request_json["options"] = {
            "num_predict": max_tokens,
        }

    with httpx.Client(timeout=60) as client:
        response = client.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=request_json,
        )

    try:
        response.raise_for_status()
        payload = response.json()
        message = payload["choices"][0]["message"]
        logger.debug("Raw model message keys: %s", list(message.keys()))
        content = message.get("content", "").strip()
        
        # Chutes uses reasoning_content; Ollama uses reasoning
        if not content:
            reasoning = (message.get("reasoning_content") or message.get("reasoning") or "").strip()
            # find all JSON-like objects, skip template placeholders, take the last real one
            candidates = re.findall(r'\{[^{}]*\}', reasoning, re.DOTALL)
            real = [c for c in candidates if '<' not in c]
            content = real[-1] if real else reasoning

        return content
    except httpx.HTTPStatusError:
        logger.exception(
            "%s chat call failed with status %s and body: %s",
            provider,
            response.status_code,
            response.text[:1000],
        )
        raise PipelineAPIError(response.status_code, _extract_error_message(response), provider) from None
    except Exception:
        logger.exception(
            "%s chat call failed with status %s and body: %s",
            provider,
            response.status_code,
            response.text[:1000],
        )
        raise


def chat_json(
    messages: list,
    user_access_token: Optional[str] = None,
    max_tokens: int = 1024,
) -> dict:
    raw = chat(messages, user_access_token, max_tokens).strip()

    # save thinking content before stripping, in case content is empty after
    think_match = re.search(r"<think>(.*?)</think>", raw, flags=re.DOTALL)
    raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()

    # if model put everything inside <think>, extract JSON from there
    if not raw and think_match:
        thinking = think_match.group(1).strip()
        json_match = re.search(r"\{.*\}", thinking, re.DOTALL)
        raw = json_match.group(0) if json_match else ""

    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        logger.exception("Failed to decode JSON model output: %s", raw[:1000])
        raise


def _extract_error_message(response: httpx.Response) -> str:
    try:
        payload = response.json()
        detail = payload.get("detail") or payload.get("error") or payload
        if isinstance(detail, dict):
            return str(detail.get("message") or detail.get("detail") or detail)
        return str(detail)
    except Exception:
        return response.text[:300]


def _mock_json(messages: list) -> dict:
    system = messages[0].get("content", "") if messages else ""
    user = messages[-1].get("content", "") if messages else ""

    if "document classifier" in system:
        lower = user.lower()
        if any(word in lower for word in ["meeting", "attendees", "agenda", "minutes"]):
            input_type = "Meeting Transcript"
        elif any(word in lower for word in ["scope", "deliverable", "objective", "stakeholder"]):
            input_type = "Project Brief"
        else:
            input_type = "General Notes"
        return {"input_type": input_type, "confidence": "82%"}

    if "structured information extractor" in system:
        tasks = _mock_tasks(user)
        risks = _mock_risks(user)
        timeline = _mock_timeline(user)
        return {
            "tasks": tasks or ["Review the notes and confirm next steps - Owner: TBD - Deadline: TBD"],
            "risks": risks,
            "timeline": timeline,
            "next_action": tasks[0] if tasks else "Review notes and assign owners.",
        }

    if "concise summariser" in system:
        return {
            "summary": "The notes have been converted into a structured work card for review. The next step is to confirm owners, deadlines, and any unresolved risks before execution."
        }

    return {}


def _mock_tasks(text: str) -> list[str]:
    task_markers = re.compile(r"(?:todo|task|action|follow up|need to|must|should)\s*:?\s*(.+)", re.IGNORECASE)
    tasks = []
    for line in text.splitlines():
        match = task_markers.search(line.strip())
        if match:
            tasks.append(f"{match.group(1).strip()} - Owner: TBD - Deadline: TBD")
    return tasks[:6]


def _mock_risks(text: str) -> list[str]:
    risks = []
    for line in text.splitlines():
        lower = line.lower()
        if any(word in lower for word in ["risk", "blocked", "blocker", "delay", "dependency", "concern"]):
            risks.append(line.strip())
    return risks[:5]


def _mock_timeline(text: str) -> list[str]:
    pattern = re.compile(r"\b(?:mon|tue|wed|thu|fri|sat|sun|today|tomorrow|next week|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b", re.IGNORECASE)
    timeline = []
    for line in text.splitlines():
        if pattern.search(line):
            timeline.append(line.strip())
    return timeline[:5]
