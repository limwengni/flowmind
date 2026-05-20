from ..chutes_client import chat_json

MODEL = "Qwen/Qwen2.5-14B-Instruct"

SYSTEM = """\
You are a concise summariser. Given extracted information from a document, write a clear 2-3 sentence summary
that captures what the document is about and what needs to happen next.

Return ONLY valid JSON — no explanation, no markdown fences.

Exact shape:
{"summary": "2-3 sentence summary here"}\
"""


def synthesize_output(processing_result: dict, access_token: str) -> dict:
    context = (
        f"Tasks: {processing_result.get('tasks', [])}\n"
        f"Risks: {processing_result.get('risks', [])}\n"
        f"Timeline: {processing_result.get('timeline', [])}\n"
        f"Next action: {processing_result.get('next_action', '')}"
    )
    try:
        result = chat_json(
            MODEL,
            [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": context},
            ],
            access_token,
            max_tokens=256,
        )
        return {
            **processing_result,
            "summary": result.get("summary", ""),
        }
    except Exception:
        return {**processing_result, "summary": ""}
