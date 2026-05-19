from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .orchestrator import build_mock_work_card


app = FastAPI(title="FlowMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProcessRequest(BaseModel):
    raw_input: str


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/process", tags=["FlowMind"], summary="Process raw text into a work card")
def process_input(payload: ProcessRequest) -> dict:
    return build_mock_work_card(payload.raw_input)