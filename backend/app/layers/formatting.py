def format_work_card(synthesis_result: dict) -> dict:
    def safe_list(val: object) -> list:
        if isinstance(val, list):
            return [str(item) for item in val if item]
        return []

    def safe_str(val: object, fallback: str = "") -> str:
        if isinstance(val, str) and val.strip():
            return val.strip()
        return fallback

    meta = synthesis_result.get("meta", {})

    return {
        "summary": safe_str(
            synthesis_result.get("summary"),
            "No summary available.",
        ),
        "tasks": safe_list(synthesis_result.get("tasks"))
            or ["No tasks identified."],
        "timeline": safe_list(synthesis_result.get("timeline")),
        "risks": safe_list(synthesis_result.get("risks"))
            or ["No risks identified."],
        "next_action": safe_str(
            synthesis_result.get("next_action"),
            "Review notes and assign owners.",
        ),
        "input_type": safe_str(meta.get("input_type"), "General Notes"),
        "confidence": safe_str(meta.get("confidence"), "88%"),
    }
