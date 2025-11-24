
# MyTeacherAcademy

One repository for both the FastAPI backend and the Next.js frontend that power the MyTeacherAcademy experience.

## Project structure
- `backend/` — FastAPI service exposing `/chat` and `/health`.
- `frontend/` — Next.js app (App Router) that consumes the backend and renders the learning UI.

## Prerequisites
- Python 3.11+ with `pip` (or `pipx`)
- Node.js 18+ with `pnpm` (preferred) or npm/yarn
- An OpenAI API key for the backend (`OPENAI_API_KEY`)

## Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export OPENAI_API_KEY="sk-..."   # set your key
uvicorn app.main:app --reload --port 8000
```
API:
- `POST /chat` — accepts `message` and `history` (see `app/schemas.py`) and returns a model-generated reply.
- `GET /health` — simple liveness probe.

## Frontend (Next.js)
```bash
cd frontend
pnpm install          # or npm install / yarn install
pnpm dev              # or npm run dev / yarn dev
```
The app expects the backend at `http://localhost:8000`. Override with:
```
export NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

## Environment variables
- `OPENAI_API_KEY` (backend) — required to call OpenAI.
- `NEXT_PUBLIC_BACKEND_URL` (frontend) — optional override for API base URL.
- `BACKEND_URL` (frontend server-side) — optional override when rendering on the server.

## Git hygiene
- Generated artifacts are ignored via `.gitignore` (virtualenvs, node_modules, build outputs, caches, env files).
- Frontend is now tracked as normal files (not a submodule).

## Useful commands
- Run backend tests (if added later): `pytest`
- Check backend formatting (if ruff/black configured later): `ruff check` / `black .`
- Frontend lint: `pnpm lint`
- Frontend build: `pnpm build`

## Deployment notes
- Backend: any ASGI-compatible host; remember to set `OPENAI_API_KEY`.
- Frontend: standard Next.js deployment (Vercel, Netlify, or custom); configure `NEXT_PUBLIC_BACKEND_URL` for the API endpoint.
