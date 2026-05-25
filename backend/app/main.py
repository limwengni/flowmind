from typing import Optional

from fastapi import Cookie, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .auth import router as auth_router
from .orchestrator import build_work_card

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


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/process", tags=["FlowMind"], summary="Process raw text into a work card")
def process_input(
    payload: ProcessRequest,
    access_token: Optional[str] = Cookie(default=None),
) -> dict:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return build_work_card(payload.raw_input, access_token)