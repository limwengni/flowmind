import re


DATE_PATTERN = re.compile(
    r"\b(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|"
    r"\d{1,2}\s(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\b",
    re.IGNORECASE,
)

RISK_KEYWORDS = (
    "risk",
    "blocker",
    "blocked",
    "delay",
    "issue",
    "problem",
    "concern",
    "dependency",
)

ACTION_KEYWORDS = (
    "todo",
    "action",
    "next",
    "follow up",
    "assign",
    "confirm",
    "finalize",
    "review",
    "send",
    "share",
    "prepare",
)

OWNER_PATTERN = re.compile(r"\bowner\s*:\s*([A-Za-z][A-Za-z ]+)", re.IGNORECASE)


def _clean_lines(raw_input: str) -> list[str]:
    lines: list[str] = []
    for raw_line in (raw_input or "").splitlines():
        cleaned = raw_line.strip()
        if not cleaned:
            continue
        cleaned = cleaned.lstrip("-*•0123456789. ").strip()
        if cleaned:
            lines.append(cleaned)
    return lines


def _extract_summary(lines: list[str], input_type: str) -> str:
    if not lines:
        return "No input details were provided yet."

    first_points = lines[:2]
    if len(first_points) == 1:
        detail = first_points[0]
    else:
        detail = " ".join(first_points)

    return (
        f"{input_type} notes were normalized into a structured execution snapshot. "
        f"Key discussion points include {detail.lower()}."
    )


def _extract_tasks(lines: list[str]) -> list[str]:
    tasks: list[str] = []
    for line in lines:
        lowered = line.lower()
        if any(keyword in lowered for keyword in ACTION_KEYWORDS):
            owner_match = OWNER_PATTERN.search(line)
            owner = owner_match.group(1).strip() if owner_match else "TBD"
            date_match = DATE_PATTERN.search(line)
            deadline = date_match.group(0) if date_match else "TBD"
            task_text = line.rstrip(".")
            tasks.append(f"{task_text} - Owner: {owner} - Deadline: {deadline}")

    if tasks:
        return tasks[:4]

    fallback = []
    for line in lines[:3]:
        fallback.append(f"{line.rstrip('.')} - Owner: TBD - Deadline: TBD")
    return fallback or ["Review incoming notes and assign an owner - Owner: TBD - Deadline: TBD"]


def _extract_timeline(lines: list[str]) -> list[str]:
    timeline = []
    for line in lines:
        if DATE_PATTERN.search(line):
            timeline.append(line.rstrip("."))
    return timeline[:4]


def _extract_risks(lines: list[str]) -> list[str]:
    risks = []
    for line in lines:
        lowered = line.lower()
        if any(keyword in lowered for keyword in RISK_KEYWORDS):
            risks.append(line.rstrip(".") + ".")

    if risks:
        return risks[:4]

    return ["No explicit risks were identified from the current notes."]


def _extract_next_action(tasks: list[str], lines: list[str]) -> str:
    if tasks:
        return tasks[0].split(" - Owner:")[0] + "."
    if lines:
        return lines[0].rstrip(".") + "."
    return "Add more input details to generate a clearer next action."


def process_input_payload(raw_input: str, understanding_result: dict) -> dict:
    lines = _clean_lines(raw_input)
    input_type = understanding_result.get("input_type", "General Notes")
    tasks = _extract_tasks(lines)

    return {
        "summary": _extract_summary(lines, input_type),
        "tasks": tasks,
        "timeline": _extract_timeline(lines),
        "risks": _extract_risks(lines),
        "next_action": _extract_next_action(tasks, lines),
        "meta": understanding_result,
        "source_preview": raw_input[:120],
    }
