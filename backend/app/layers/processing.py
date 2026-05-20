from ..chutes_client import chat_json

MODEL = "Qwen/Qwen2.5-14B-Instruct"

SYSTEM = """\
You are a structured information extractor. Given raw notes or a document, extract the following:

- tasks: action items (append "- Owner: X - Deadline: Y" where mentioned, otherwise use TBD)
- risks: blockers, risks, concerns, or dependencies
- timeline: any date-referenced milestones or events
- next_action: the single most urgent next step

Return ONLY valid JSON — no explanation, no markdown fences.

Exact shape:
{
  "tasks": ["action item - Owner: X - Deadline: Y"],
  "risks": ["risk or blocker"],
  "timeline": ["date-referenced milestone"],
  "next_action": "most urgent next step"
}\
"""


def process_input_payload(raw_input: str, understanding_result: dict, access_token: str) -> dict:
    try:
        result = chat_json(
            MODEL,
            [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": raw_input},
            ],
            access_token,
            max_tokens=800,
        )
        return {
            "tasks": result.get("tasks", []),
            "risks": result.get("risks", []),
            "timeline": result.get("timeline", []),
            "next_action": result.get("next_action", ""),
            "meta": understanding_result,
        }
    except Exception:
        return {
            "tasks": [],
            "risks": [],
            "timeline": [],
            "next_action": "",
            "meta": understanding_result,
        }
