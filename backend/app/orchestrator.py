from .layers.formatting import format_work_card
from .layers.processing import process_input_payload
from .layers.synthesis import synthesize_output
from .layers.understanding import understand_input


def build_understanding(raw_input: str, access_token: str) -> dict:
    return understand_input(raw_input, access_token)


def build_work_card_from_understanding(
    raw_input: str,
    understanding_result: dict,
    access_token: str,
) -> dict:
    processing_result = process_input_payload(raw_input, understanding_result, access_token)
    synthesis_result = synthesize_output(processing_result, access_token)
    return format_work_card(synthesis_result)


def build_work_card(raw_input: str, access_token: str) -> dict:
    understanding_result = build_understanding(raw_input, access_token)
    return build_work_card_from_understanding(raw_input, understanding_result, access_token)
