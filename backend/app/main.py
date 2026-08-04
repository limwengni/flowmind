import os
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, Cookie, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .ai_client import PipelineAPIError, active_provider, requires_user_token
from .auth import guest_access_token, router as auth_router
from .orchestrator import build_understanding, build_work_card, build_work_card_from_understanding

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass

app = FastAPI(title="FlowMind API")

_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = os.getenv("API_PREFIX", "")
app.include_router(auth_router, prefix=API_PREFIX)

router = APIRouter(prefix=API_PREFIX)


class ProcessRequest(BaseModel):
    raw_input: str


class UnderstandingResponse(BaseModel):
    input_type: str
    confidence: str


class ProcessWithUnderstandingRequest(BaseModel):
    raw_input: str
    input_type: str
    confidence: str


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


def _resolve_access_token(access_token: Optional[str], guest_session: Optional[str]) -> Optional[str]:
    return access_token or guest_access_token(guest_session)


def _require_session(access_token: Optional[str], guest_session: Optional[str]) -> None:
    if requires_user_token() and not _resolve_access_token(access_token, guest_session):
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


@router.post("/understand", tags=["FlowMind"], summary="Classify the input and return initial confidence")
def understand_only(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
    guest_session: Optional[str] = Cookie(default=None),
) -> UnderstandingResponse:
    resolved_access_token = _resolve_access_token(access_token, guest_session)
    _require_session(access_token, guest_session)
    try:
        return build_understanding(payload.raw_input, resolved_access_token)
    except PipelineAPIError as error:
        _raise_pipeline_error(error)


@router.post("/process", tags=["FlowMind"], summary="Process raw text into a work card")
def process_input(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
    guest_session: Optional[str] = Cookie(default=None),
) -> dict:
    resolved_access_token = _resolve_access_token(access_token, guest_session)
    _require_session(access_token, guest_session)
    try:
        return build_work_card(payload.raw_input, resolved_access_token)
    except PipelineAPIError as error:
        _raise_pipeline_error(error)


@router.post("/process-from-understanding", tags=["FlowMind"], summary="Process the remaining pipeline layers")
def process_from_understanding(
    payload: ProcessWithUnderstandingRequest,
    access_token: Optional[str] = Cookie(default=None),
    guest_session: Optional[str] = Cookie(default=None),
) -> dict:
    resolved_access_token = _resolve_access_token(access_token, guest_session)
    _require_session(access_token, guest_session)
    understanding_result = {
        "input_type": payload.input_type,
        "confidence": payload.confidence,
    }
    try:
        return build_work_card_from_understanding(payload.raw_input, understanding_result, resolved_access_token)
    except PipelineAPIError as error:
        _raise_pipeline_error(error)


app.include_router(router)
