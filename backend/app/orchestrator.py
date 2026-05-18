from .layers.formatting import format_work_card
from .layers.processing import process_input_payload
from .layers.synthesis import synthesize_output
from .layers.understanding import understand_input


def build_mock_work_card(raw_input: str) -> dict:
    understanding_result = understand_input(raw_input)
    processing_result = process_input_payload(raw_input, understanding_result)
    synthesis_result = synthesize_output(processing_result)
    return format_work_card(synthesis_result)
