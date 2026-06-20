import base64
import hashlib
import os
import secrets
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Response
from fastapi.responses import RedirectResponse

from .ai_client import active_provider, requires_user_token

CHUTES_BASE = "https://api.chutes.ai"
CLIENT_ID = os.getenv("CHUTES_CLIENT_ID", "cid_dlcb9nbfihc5hekai9wcty82")
CLIENT_SECRET = os.getenv("CHUTES_CLIENT_SECRET", "csc_ZuqH7VgEZPr5LKyvR9ZXzo0cNd0d9qElIZHnMjRF5ekGark4")
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


def _set_auth_cookies(response: Response, access_token: str, refresh_token: Optional[str] = None) -> None:
    response.set_cookie("access_token", access_token, httponly=True, samesite="lax")
    if refresh_token:
        response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax")


def _refresh_tokens(refresh_token: str) -> dict:
    with httpx.Client() as client:
        response = client.post(
            f"{CHUTES_BASE}/idp/token",
            data={
                "grant_type": "refresh_token",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "refresh_token": refresh_token,
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")

    return response.json()


def _fetch_userinfo(access_token: str) -> Optional[dict]:
    with httpx.Client() as client:
        response = client.get(
            f"{CHUTES_BASE}/idp/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if response.status_code == 200:
        return response.json()
    if response.status_code == 401:
        return None
    raise HTTPException(status_code=502, detail="Could not verify your Chutes session right now.")


@router.get("/login")
def login():
    if not requires_user_token():
        return RedirectResponse(FRONTEND_URL)

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
    _set_auth_cookies(redirect, tokens["access_token"], tokens.get("refresh_token"))
    return redirect


@router.get("/me")
def me(
    response: Response,
    access_token: Optional[str] = Cookie(default=None),
    refresh_token: Optional[str] = Cookie(default=None),
):
    if not requires_user_token() and not access_token:
        return {
            "name": "Local tester",
            "provider": active_provider(),
        }

    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = _fetch_userinfo(access_token)
    if user is not None:
        return user

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")

    tokens = _refresh_tokens(refresh_token)
    new_access_token = tokens["access_token"]
    new_refresh_token = tokens.get("refresh_token", refresh_token)
    _set_auth_cookies(response, new_access_token, new_refresh_token)

    user = _fetch_userinfo(new_access_token)
    if user is None:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")

    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"ok": True}
