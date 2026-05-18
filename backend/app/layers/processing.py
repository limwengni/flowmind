def process_input_payload(raw_input: str, understanding_result: dict) -> dict:
    return {
        "summary": "Mock summary generated from placeholder processing.",
        "tasks": [
            {
                "title": "Replace placeholder extraction",
                "owner": None,
                "status": "pending",
            }
        ],
        "timeline": [],
        "risks": [],
        "next_action": "Implement real extraction logic in Day 1 development.",
        "meta": understanding_result,
        "source_preview": raw_input[:120],
    }
