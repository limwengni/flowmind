import logging
from typing import Optional

from ..ai_client import PipelineAPIError, chat_json

logger = logging.getLogger(__name__)

SYSTEM = """\
You are a concise summariser. Given extracted information from a document, write a clear 2-3 sentence summary
that captures what the document is about and what needs to happen next.

Write naturally for a human reader.
Do not include raw owner/deadline metadata in parentheses.
Instead, turn ownership and deadlines into normal sentences when relevant.

Return ONLY valid JSON — no explanation, no markdown fences, no thinking, no reasoning blocks.
Output the JSON directly as your response content.

Exact shape:
{"summary": "2-3 sentence summary here"}\
"""


def synthesize_output(processing_result: dict, access_token: Optional[str]) -> dict:
    context = (
        f"Tasks: {processing_result.get('tasks', [])}\n"
        f"Risks: {processing_result.get('risks', [])}\n"
        f"Timeline: {processing_result.get('timeline', [])}\n"
        f"Next action: {processing_result.get('next_action', '')}"
    )
    try:
        result = chat_json(
            [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": context},
            ],
            access_token,
            max_tokens=4096,
        )
        return {
            **processing_result,
            "summary": result.get("summary", ""),
        }
    except PipelineAPIError:
        logger.exception("Synthesis layer failed due to AI provider error.")
        raise
    except Exception:
        logger.exception("Synthesis layer failed; using fallback response.")
        return {**processing_result, "summary": ""}
