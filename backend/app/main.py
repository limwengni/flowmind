from typing import Optional

from fastapi import Cookie, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .auth import router as auth_router
from .chutes_client import ChutesAPIError
from .orchestrator import build_understanding, build_work_card, build_work_card_from_understanding

try:
    from dotenv import load_dotenv
    load_dotenv()
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


def _raise_pipeline_error(error: ChutesAPIError) -> None:
    if error.status_code == 402:
        raise HTTPException(
            status_code=402,
            detail="Chutes credits are unavailable for this account right now. Connect a funded API key or top up credits to continue.",
        )
    if error.status_code >= 500:
        raise HTTPException(
            status_code=502,
            detail="Chutes is temporarily unavailable right now. Please try again in a moment.",
        )
    raise HTTPException(
        status_code=502,
        detail="FlowMind could not complete the Chutes request right now. Please try again in a moment.",
    )


@app.post("/understand", tags=["FlowMind"], summary="Classify the input and return initial confidence")
def understand_only(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> UnderstandingResponse:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return build_understanding(payload.raw_input, access_token)
    except ChutesAPIError as error:
        _raise_pipeline_error(error)


@app.post("/process", tags=["FlowMind"], summary="Process raw text into a work card")
def process_input(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> dict:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return build_work_card(payload.raw_input, access_token)
    except ChutesAPIError as error:
        _raise_pipeline_error(error)


@app.post("/process-from-understanding", tags=["FlowMind"], summary="Process the remaining pipeline layers")
def process_from_understanding(
    payload: ProcessWithUnderstandingRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> dict:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    understanding_result = {
        "input_type": payload.input_type,
        "confidence": payload.confidence,
    }
    try:
        return build_work_card_from_understanding(payload.raw_input, understanding_result, access_token)
    except ChutesAPIError as error:
        _raise_pipeline_error(error)
