def format_work_card(synthesis_result: dict) -> dict:
    return {
        "summary": synthesis_result.get("summary", ""),
        "tasks": synthesis_result.get("tasks", []),
        "timeline": synthesis_result.get("timeline", []),
        "risks": synthesis_result.get("risks", []),
        "next_action": synthesis_result.get("next_action"),
    }
