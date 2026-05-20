import json

import httpx

CHUTES_LLM_BASE = "https://llm.chutes.ai/v1"


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
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


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

    return json.loads(raw.strip())
