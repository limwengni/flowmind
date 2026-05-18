from fastapi import FastAPI
from pydantic import BaseModel

from .orchestrator import build_mock_work_card


app = FastAPI(title="FlowMind API")


class ProcessRequest(BaseModel):
    raw_input: str


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/process")
def process_input(payload: ProcessRequest) -> dict:
    return build_mock_work_card(payload.raw_input)
