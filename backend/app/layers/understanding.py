from ..chutes_client import chat_json

MODEL = "meta-llama/Llama-3.1-8B-Instruct"

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
        return {"input_type": "General Notes", "confidence": "88%"}
