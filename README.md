# my-fin

Privacy-first, local-first personal finance workspace.

## Repository Layout

- `frontend/` - Expo Router + TypeScript app for iOS, Android, and Web.
- `backend/` - FastAPI service scaffold reserved for later sync, auth, and parser APIs.
- `project-docs/` - living docs derived from the PRD and implementation notes.

## Frontend

```bash
cd frontend
npm run web
npm run typecheck
```

The current frontend uses typed dummy data for the MVP 1 local shell:

- Anonymous local onboarding
- Net liquidity dashboard
- Local regex parser demo
- Bills and due matrix
- Vacation sandbox
- Portfolio and net worth view

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The backend is only initialized for structure right now. Product logic should stay frontend-first until the local shell and dummy-data flows are signed off.
