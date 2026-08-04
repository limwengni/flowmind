# FlowMind

**Live:** https://flowmind-alpha.vercel.app

FlowMind turns messy, unstructured text — meeting notes, project briefs, random notes — into a structured, execution-ready work card with a summary, task list, timeline, risks, and next action. Tasks are automatically populated into a drag-and-drop Kanban board.

Built for the Chutes AI Hackathon.

## How it works

The backend runs a four-layer AI pipeline powered by Chutes:

1. **Understanding** — classifies the input type and confidence
2. **Processing** — extracts tasks, risks, timeline, owners, and deadlines
3. **Synthesis** — writes a unified summary and picks the next action
4. **Formatting** — validates the schema and fills any missing fallback values

Authentication uses **Sign in with Chutes** (OAuth 2.0 + PKCE). Each user signs in with their own Chutes account — AI usage bills to their account, not the app owner's.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** FastAPI + Python
- **AI:** Chutes (`Qwen/Qwen3.6-27B-TEE`) via user OAuth token
- **Auth:** Chutes OAuth 2.0 with PKCE

## Project Structure

```
flowmind/
├── backend/
│   ├── app/
│   │   ├── layers/         # understanding, processing, synthesis, formatting
│   │   ├── ai_client.py    # Chutes / OpenAI-compatible chat client
│   │   ├── auth.py         # OAuth flow: login, callback, me, logout
│   │   ├── main.py
│   │   ├── models.py
│   │   └── orchestrator.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # InputBox, KanbanBoard, LoginPage, OutputCard, PipelineVisualizer
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── archive/                # planning docs from development
└── README.md
```

## Running Locally

### 1. Register your OAuth app on Chutes

Go to your Chutes account → OAuth Apps and create a new app with:
- Redirect URI: `http://localhost:8000/auth/callback`
- Scopes: `openid`, `profile`, `chutes:invoke`, `balance:read`, `quota:read`, `usage:read`

Save the `client_id` and `client_secret`.

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

```env
CHUTES_CLIENT_ID=cid_xxx
CHUTES_CLIENT_SECRET=csc_xxx
CHUTES_API_KEY=cpk_xxx
CHUTES_REDIRECT_URI=http://localhost:8000/auth/callback
FRONTEND_URL=http://localhost:5173
AI_PROVIDER=chutes
FLOWMIND_MODEL=Qwen/Qwen3.6-27B-TEE
```

### 3. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — sign in with your Chutes account to use the pipeline.

---

### Alternative: Ollama (local, no Chutes account needed)

```env
AI_PROVIDER=openai_compatible
FLOWMIND_MODEL=qwen3:8b
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
```

Set `VITE_DEBUG_PREVIEW=true` in `frontend/.env` to skip login and use demo output.

## Deployment (Vercel)

Both services deploy from the same repo via `vercel.json`. The frontend and backend are served from the same domain — all `/api/*` requests are routed to the FastAPI backend.

**Backend env vars (Vercel):**

| Variable | Value |
|---|---|
| `CHUTES_CLIENT_ID` | Your Chutes OAuth client ID |
| `CHUTES_CLIENT_SECRET` | Your Chutes OAuth client secret |
| `CHUTES_API_KEY` | Server-side Chutes API key used for guest AI access |
| `CHUTES_REDIRECT_URI` | `https://flowmind-alpha.vercel.app/api/auth/callback` |
| `FRONTEND_URL` | `https://flowmind-alpha.vercel.app` |
| `API_PREFIX` | `/api` |

**Frontend env vars (Vercel):**

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `/api` |

## Environment Variables (Local)

| Variable | Description |
|---|---|
| `CHUTES_CLIENT_ID` | OAuth app client ID from Chutes |
| `CHUTES_CLIENT_SECRET` | OAuth app client secret from Chutes |
| `CHUTES_API_KEY` | Server-side Chutes API key used for guest AI access |
| `CHUTES_REDIRECT_URI` | Must match the redirect URI registered on Chutes |
| `FRONTEND_URL` | Where to redirect after login (e.g. `http://localhost:5173`) |
| `AI_PROVIDER` | `chutes` or `openai_compatible` |
| `FLOWMIND_MODEL` | Model ID to use (default: `Qwen/Qwen3.6-27B-TEE`) |
| `AI_BASE_URL` | Base URL for OpenAI-compatible providers |
| `AI_API_KEY` | API key for OpenAI-compatible providers |
