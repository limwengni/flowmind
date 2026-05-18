# FlowMind

FlowMind is a structured AI pipeline that transforms messy, unstructured text into execution-ready output.

The system is designed around a fixed four-layer flow:

1. Understanding
2. Processing
3. Synthesis
4. Formatting

The output format stays consistent regardless of input type and is intended to produce a structured work card containing:

- Summary
- Tasks
- Timeline
- Risks
- Next Action

## Current Status

This repository currently contains:

- a mock React frontend UI
- a placeholder FastAPI backend
- static demo data
- an initial frontend and backend project structure

No real AI pipeline logic or live API integration has been implemented yet.

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: FastAPI + Python

## Project Structure

```text
flowmind/
├── backend/
│   ├── app/
│   │   ├── layers/
│   │   ├── main.py
│   │   ├── models.py
│   │   └── orchestrator.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Running Locally

### Frontend

```powershell
cd C:\Users\lim12\Documents\flowmind\frontend
npm install
npm run dev
```

### Backend

```powershell
cd C:\Users\lim12\Documents\flowmind\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Notes

- This project currently uses mock data and placeholder application logic.
- The frontend and backend are not fully integrated yet.
- The current `/process` endpoint returns mock structured output only.
