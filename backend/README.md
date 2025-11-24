# FastAPI Backend

This directory holds a lightweight FastAPI service that powers the chat experience.

## Features

- `/chat` endpoint accepts the latest user message plus conversation history and responds with sentence-friendly assistant replies using LangChain + OpenAI.
- `/health` endpoint for simple liveness checks.
- CORS support so the Next.js frontend can call the API during development.

## Running locally

1. Create a virtual environment (optional but recommended):

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install requirements:

   ```bash
   pip install -r requirements.txt
   ```

3. Export your OpenAI API key (the LangChain integration reads `OPENAI_API_KEY`):

   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

4. Start the server:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

The Next.js app calls `http://localhost:8000/chat` by default. Override the host by setting `BACKEND_URL` (or `NEXT_PUBLIC_BACKEND_URL`) when running the frontend.
