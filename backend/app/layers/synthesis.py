def synthesize_output(processing_result: dict) -> dict:
    return {
        "summary": processing_result.get("summary"),
        "tasks": processing_result.get("tasks", []),
        "timeline": processing_result.get("timeline", []),
        "risks": processing_result.get("risks", []),
        "next_action": processing_result.get("next_action"),
        "input_type": processing_result.get("meta", {}).get("input_type"),
        "confidence": processing_result.get("meta", {}).get("confidence"),
    }
