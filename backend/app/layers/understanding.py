import logging

from ..chutes_client import chat_json

MODEL = "Qwen/Qwen3.6-27B-TEE"
logger = logging.getLogger(__name__)

SYSTEM = """\
You are a document classifier. Analyse the input text and return ONLY valid JSON — no explanation, no markdown fences.

Return this exact shape:
{"input_type": "<Meeting Transcript|Project Brief|General Notes>", "confidence": "<e.g. 94%>"}\
"""


def understand_input(raw_input: str, access_token: str) -> dict:
    try:
        result = chat_json(
            MODEL,
            [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": raw_input},
            ],
            access_token,
            max_tokens=64,
        )
        return {
            "input_type": result.get("input_type", "General Notes"),
            "confidence": result.get("confidence", "88%"),
        }
    except Exception:
        logger.exception("Understanding layer failed; using fallback response.")
        return {"input_type": "General Notes", "confidence": "88%"}
