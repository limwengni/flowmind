import logging
from typing import Optional

from ..ai_client import PipelineAPIError, chat_json

logger = logging.getLogger(__name__)

SYSTEM = """\
You are a document classifier. Analyse the input text and return ONLY valid JSON — no explanation, no markdown fences.

Use calibrated confidence; avoid defaulting to 95%.
Use higher confidence only when the document structure is obvious.
Use lower confidence when the input is short, messy, mixed-format, or ambiguous.

Return this exact shape:
{"input_type": "<Meeting Transcript|Project Brief|General Notes>", "confidence": "<e.g. 84%>"}\
"""


def understand_input(raw_input: str, access_token: Optional[str]) -> dict:
    try:
        result = chat_json(
            [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": raw_input},
            ],
            access_token,
            max_tokens=512,
        )
        return {
            "input_type": result.get("input_type", "General Notes"),
            "confidence": result.get("confidence", "88%"),
        }
    except PipelineAPIError:
        logger.exception("Understanding layer failed due to AI provider error.")
        raise
    except Exception:
        logger.exception("Understanding layer failed; using fallback response.")
        return {"input_type": "General Notes", "confidence": "88%"}
