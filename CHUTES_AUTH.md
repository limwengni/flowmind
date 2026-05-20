# Chutes OAuth — Implementation Notes

## What was implemented

| File | What changed |
|------|-------------|
| `backend/app/auth.py` | New — full OAuth flow: `/auth/login`, `/auth/callback`, `/auth/me`, `/auth/logout` with PKCE |
| `backend/app/chutes_client.py` | New — shared helper that calls `https://llm.chutes.ai/v1` using the user's token |
| `backend/app/orchestrator.py` | Updated — accepts `access_token`, passes it to every layer |
| `backend/app/layers/understanding.py` | Real AI — Llama 3.1 8B classifies the document type |
| `backend/app/layers/processing.py` | Real AI — Qwen 2.5 14B extracts tasks, risks, timeline, next action |
| `backend/app/layers/synthesis.py` | Real AI — Qwen 2.5 14B writes the summary |
| `backend/app/layers/formatting.py` | Updated — validates schema and fills fallback values |
| `backend/app/main.py` | Includes auth router, `/process` requires cookie, passes token to orchestrator |
| `backend/requirements.txt` | Added `httpx`, `python-dotenv` |
| `frontend/src/components/LoginPage.jsx` | New — login screen with "Sign in with Chutes" button |
| `frontend/src/App.jsx` | Checks `/auth/me` on load, gates app behind login, shows username + sign out |
| `backend/.env.example` | New — template for your environment variables |

## How the flow works

1. User lands on the app → frontend calls `GET /auth/me`
2. If not logged in → shows the login screen
3. User clicks "Sign in with Chutes" → redirected to `GET /auth/login` on the backend
4. Backend generates PKCE + state, redirects user to Chutes `/idp/authorize`
5. User logs in on Chutes → redirected back to `GET /auth/callback`
6. Backend exchanges the code for tokens, sets HttpOnly cookies, redirects to frontend
7. Frontend now shows the main app with username + sign out button
8. All `/process` calls include the cookie automatically

---

## What you need to do to get it working

### Step 1 — Register your app on Chutes

Run this once with your Chutes API key:

```bash
curl -X POST https://chutes.ai/idp/apps \
  -H "Authorization: Bearer YOUR_CHUTES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "FlowMind",
        "description": "FlowMind hackathon app",
        "redirect_uris": ["http://localhost:8000/auth/callback"],
        "scopes": ["openid", "profile", "chutes:invoke"]
      }'
```

Replace `YOUR_CHUTES_API_KEY` with your actual Chutes API key (the one you use to call their AI API). You can find it in your Chutes account settings.

The response will give you back `client_id` (looks like `cid_xxx`) and `client_secret` (looks like `csc_xxx`) — paste those into `backend/.env`.

### Step 2 — Create your `.env` file (DO NOT SKIP THIS — the app will not call any AI without it)


```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in the values:

```
CHUTES_CLIENT_ID=cid_xxx
CHUTES_CLIENT_SECRET=csc_xxx
CHUTES_REDIRECT_URI=http://localhost:8000/auth/callback
FRONTEND_URL=http://localhost:5173
```

### Step 3 — Install new backend dependencies

```bash
pip install httpx python-dotenv
```

Or reinstall everything from requirements:

```bash
pip install -r backend/requirements.txt
```

### Step 4 — Run the app as normal

Backend:
```bash
uvicorn app.main:app --reload
```

Frontend:
```bash
npm run dev
```

Then open `http://localhost:5173` — you should see the login screen.
