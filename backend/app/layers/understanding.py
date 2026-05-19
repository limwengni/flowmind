def understand_input(raw_input: str) -> dict:
    normalized_input = (raw_input or "").lower()
    if "meeting" in normalized_input or "sync" in normalized_input:
        input_type = "Meeting Transcript"
        confidence = "94%"
    elif "brief" in normalized_input or "project" in normalized_input:
        input_type = "Project Brief"
        confidence = "91%"
    else:
        input_type = "General Notes"
        confidence = "88%"

    return {
        "input_type": input_type,
        "confidence": confidence,
        "analysis_mode": "heuristic-classification",
        "notes": "Input type inferred from lightweight keyword matching.",
        "raw_length": len(raw_input or ""),
    }
