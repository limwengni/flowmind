import base64
import hashlib
import os
import secrets
from typing import Optional
from urllib.parse import urlencode
from dotenv import load_dotenv
load_dotenv()

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Response
from fastapi.responses import RedirectResponse

CHUTES_BASE = "https://api.chutes.ai"
CLIENT_ID = os.getenv("CHUTES_CLIENT_ID", "YOUR_CLIENT_ID")
CLIENT_SECRET = os.getenv("CHUTES_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
REDIRECT_URI = os.getenv("CHUTES_REDIRECT_URI", "http://localhost:8000/auth/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# state -> code_verifier, lives only for the duration of the OAuth round-trip
_pending: dict[str, str] = {}

router = APIRouter(prefix="/auth", tags=["Auth"])


def _pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    return verifier, challenge


@router.get("/login")
def login():
    verifier, challenge = _pkce_pair()
    state = secrets.token_urlsafe(32)
    _pending[state] = verifier

    url = f"{CHUTES_BASE}/idp/authorize?" + urlencode({
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "openid profile chutes:invoke",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    })
    return RedirectResponse(url)


@router.get("/callback")
def callback(code: str, state: str):
    verifier = _pending.pop(state, None)
    if verifier is None:
        raise HTTPException(status_code=400, detail="Invalid or expired state")

    with httpx.Client() as client:
        r = client.post(
            f"{CHUTES_BASE}/idp/token",
            data={
                "grant_type": "authorization_code",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URI,
                "code_verifier": verifier,
            },
        )

    if r.status_code != 200:
        raise HTTPException(status_code=400, detail="Token exchange failed")

    tokens = r.json()
    redirect = RedirectResponse(FRONTEND_URL, status_code=302)
    redirect.set_cookie("access_token", tokens["access_token"], httponly=True, samesite="lax")
    redirect.set_cookie("refresh_token", tokens["refresh_token"], httponly=True, samesite="lax")
    return redirect


@router.get("/me")
def me(access_token: Optional[str] = Cookie(default=None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    with httpx.Client() as client:
        r = client.get(
            f"{CHUTES_BASE}/idp/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    return r.json()


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"ok": True}
