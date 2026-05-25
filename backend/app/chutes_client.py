import json
import logging

import httpx

CHUTES_LLM_BASE = "https://llm.chutes.ai/v1"
logger = logging.getLogger(__name__)


class ChutesAPIError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def chat(
    model: str,
    messages: list,
    access_token: str,
    max_tokens: int = 512,
    temperature: float = 0.3,
) -> str:
    with httpx.Client(timeout=60) as client:
        r = client.post(
            f"{CHUTES_LLM_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        try:
            r.raise_for_status()
            payload = r.json()
            return payload["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError:
            logger.exception(
                "Chutes chat call failed for model %s with status %s and body: %s",
                model,
                r.status_code,
                r.text[:1000],
            )
            try:
                payload = r.json()
                detail = payload.get("detail", {})
                if isinstance(detail, dict):
                    message = detail.get("message", r.text[:300])
                else:
                    message = str(detail)
            except Exception:
                message = r.text[:300]
            raise ChutesAPIError(r.status_code, message) from None
        except Exception:
            logger.exception(
                "Chutes chat call failed for model %s with status %s and body: %s",
                model,
                r.status_code,
                r.text[:1000],
            )
            raise


def chat_json(
    model: str,
    messages: list,
    access_token: str,
    max_tokens: int = 512,
) -> dict:
    raw = chat(model, messages, access_token, max_tokens).strip()

    # strip markdown code fences if the model wraps its output
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        logger.exception("Failed to decode JSON model output for %s: %s", model, raw[:1000])
        raise
