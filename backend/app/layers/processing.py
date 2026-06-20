import logging
from typing import Optional

from ..ai_client import PipelineAPIError, chat_json

logger = logging.getLogger(__name__)

SYSTEM = """\
You are a structured information extractor. Given raw notes or a document, extract the following:

- tasks: action items (append "- Owner: X - Deadline: Y" where mentioned, otherwise use TBD).
  If ownership is ambiguous or disputed, preserve the candidates instead of dropping them.
  Example: "- Owner: Nina/Product or Jay/Support - Deadline: TBD".
- risks: blockers, risks, concerns, or dependencies
- timeline: create a practical execution timeline from the document.
  Include explicit dates when provided.
  If only vague timing is provided, infer ordered milestones using relative dates.
  Mark inferred items with "(inferred)".
  Do not invent exact calendar dates unless the source gives enough information.
- next_action: the single most urgent next step

Return ONLY valid JSON — no explanation, no markdown fences, no thinking, no reasoning blocks.
Output the JSON directly as your response content.

Exact shape:
{
  "tasks": ["action item - Owner: X - Deadline: Y"],
  "risks": ["risk or blocker"],
  "timeline": ["explicit or inferred milestone"],
  "next_action": "most urgent next step"
}\
"""


def process_input_payload(raw_input: str, understanding_result: dict, access_token: Optional[str]) -> dict:
    try:
        result = chat_json(
            [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": raw_input},
            ],
            access_token,
            max_tokens=2048,
        )
        return {
            "tasks": result.get("tasks", []),
            "risks": result.get("risks", []),
            "timeline": result.get("timeline", []),
            "next_action": result.get("next_action", ""),
            "meta": understanding_result,
        }
    except PipelineAPIError:
        logger.exception("Processing layer failed due to AI provider error.")
        raise
    except Exception:
        logger.exception("Processing layer failed; using fallback response.")
        return {
            "tasks": [],
            "risks": [],
            "timeline": [],
            "next_action": "",
            "meta": understanding_result,
        }
