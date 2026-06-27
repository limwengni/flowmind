# FlowMind — Auth Planning

## The best use of login

Right now the 4 pipeline layers are heuristics/mock logic.
The login gives every user a `chutes:invoke` access token — meaning you can use that
token to call real Chutes AI models inside the pipeline, and the usage bills to the
user's own Chutes account. You pay zero compute costs as the app owner.

That is the main value of login here. Not card saving — replacing fake logic with
real AI, funded by the user.

---

## What changes

### Today (mock)
```
User input → heuristics in Python → fake output
```

### After (real)
```
User input → Chutes AI (user's token) → real structured output
```

The access token from the login cookie gets passed into the orchestrator and used
as the Bearer token on every Chutes API call.

---

## Pipeline layer plan

Each layer calls a real model on Chutes using the user's access token.

### Layer 1 — Understanding (Llama 3.1 8B)
- **Job:** Classify the input type and set confidence
- **Why this model:** Fast, cheap, simple classification task
- **Prompt goal:** Return `input_type` and `confidence` as JSON

### Layer 2 — Processing (Qwen 2.5 14B)
- **Job:** Extract tasks, risks, timeline, owners, dates from the raw text
- **Why this model:** Stronger instruction following, better at structured extraction
- **Prompt goal:** Return structured JSON with `tasks[]`, `risks[]`, `timeline[]`

### Layer 3 — Synthesis (Qwen 2.5 14B)
- **Job:** Combine extracted fields into one unified summary and pick the best `next_action`
- **Why this model:** Same model, keeps context consistent with layer 2
- **Prompt goal:** Return `summary` and `next_action` as JSON

### Layer 4 — Formatting (Llama 3.1 8B)
- **Job:** Validate and clean the final shape, fill in any missing fallback values
- **Why this model:** Fast, just doing schema enforcement not heavy reasoning
- **Prompt goal:** Return the final clean work card JSON

---

## How the token flows

```
Frontend cookie (access_token)
    ↓
POST /process (backend reads cookie)
    ↓
orchestrator(raw_input, access_token)
    ↓
each layer calls Chutes AI with:
    Authorization: Bearer <access_token>
```

No API key stored in the backend. No compute cost to you.

---

## Token expiry handling

Access tokens expire after ~1 hour.
When a layer gets a 401 back from Chutes:

1. Use the `refresh_token` cookie to call `POST /idp/token` with `grant_type=refresh_token`
2. Get a new `access_token`
3. Set the new cookie on the response
4. Retry the failed layer call

Add this refresh logic in `auth.py` as a helper so each layer can call it.

---

## What to build next (priority order)

1. Update `orchestrator.py` — accept `access_token` param, pass it to each layer
2. Update each layer — replace heuristics with a real Chutes API call using the token
3. Update `main.py` — extract `access_token` from cookie and pass it to orchestrator
4. Add token refresh helper in `auth.py`
5. Test end to end with a real Chutes account

---

## What NOT to do

- Do not store the access token anywhere except the HttpOnly cookie
- Do not call Chutes from the frontend — always go through the backend
- Do not skip the formatting layer even when the AI output looks clean — it catches bad JSON shapes
