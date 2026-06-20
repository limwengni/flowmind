from typing import Optional
from pathlib import Path

from fastapi import Cookie, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .ai_client import PipelineAPIError, active_provider, requires_user_token
from .auth import router as auth_router
from .orchestrator import build_understanding, build_work_card, build_work_card_from_understanding

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass

app = FastAPI(title="FlowMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


class ProcessRequest(BaseModel):
    raw_input: str


class UnderstandingResponse(BaseModel):
    input_type: str
    confidence: str


class ProcessWithUnderstandingRequest(BaseModel):
    raw_input: str
    input_type: str
    confidence: str


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


def _require_session(access_token: Optional[str]) -> None:
    if requires_user_token() and not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")


def _raise_pipeline_error(error: PipelineAPIError) -> None:
    provider_name = error.provider.title()
    if error.provider == "chutes" and error.status_code == 402:
        raise HTTPException(
            status_code=402,
            detail="Chutes credits are unavailable for this account right now. Connect a funded API key or top up credits to continue.",
        )
    if error.status_code >= 500:
        raise HTTPException(
            status_code=502,
            detail=f"{provider_name} is temporarily unavailable right now. Please try again in a moment.",
        )
    raise HTTPException(
        status_code=502,
        detail=f"FlowMind could not complete the {active_provider()} request right now. Please try again in a moment.",
    )


@app.post("/understand", tags=["FlowMind"], summary="Classify the input and return initial confidence")
def understand_only(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> UnderstandingResponse:
    _require_session(access_token)
    try:
        return build_understanding(payload.raw_input, access_token)
    except PipelineAPIError as error:
        _raise_pipeline_error(error)


@app.post("/process", tags=["FlowMind"], summary="Process raw text into a work card")
def process_input(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> dict:
    _require_session(access_token)
    try:
        return build_work_card(payload.raw_input, access_token)
    except PipelineAPIError as error:
        _raise_pipeline_error(error)


@app.post("/process-from-understanding", tags=["FlowMind"], summary="Process the remaining pipeline layers")
def process_from_understanding(
    payload: ProcessWithUnderstandingRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> dict:
    _require_session(access_token)
    understanding_result = {
        "input_type": payload.input_type,
        "confidence": payload.confidence,
    }
    try:
        return build_work_card_from_understanding(payload.raw_input, understanding_result, access_token)
    except PipelineAPIError as error:
        _raise_pipeline_error(error)
