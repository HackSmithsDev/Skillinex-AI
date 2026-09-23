# Skillinex AI

Skillinex is an AI-powered learning platform that generates personalized course
roadmaps, runs an in-browser coding lab, and gives students an AI mentor to chat
with while they study. It ships as a web app, a mobile app (Expo/React Native),
and a FastAPI backend with async workers.

## Monorepo layout

```
backend/     FastAPI + PostgreSQL + Celery + Redis (API, auth, AI integrations)
frontend/    React + Vite web client
mobile/      Expo / React Native mobile client
data/        Shared runtime storage (profile pictures, generated roadmaps)
Dockerfile   Production image: builds frontend, bundles backend, nginx, cloudflared
start.sh     Container entrypoint: runs migrations, Celery worker, API, tunnel
render.yaml  Render.com deployment blueprint
```

## Core features

- **AI roadmap generation** — Groq (Llama) drafts a course skeleton and lecture
  content per user's chosen topic/difficulty; results are cached to disk and
  persisted to Postgres (`backend/app/workers/tasks/roadmap`).
- **AI mentor chat** — Groq-backed chat sessions with history (`backend/app/routers/api`).
- **Practice / online compiler lab** — in-browser Monaco editor that executes
  code through the Wandbox public API, with language selection driven by the
  learner's enrolled courses (`backend/app/routers/study/practice.py`,
  `frontend/src/pages/Practice`).
- **Auth & profiles** — JWT auth, OTP-based password reset, avatar uploads.
- **Background jobs** — Celery handles roadmap generation and transactional
  email (welcome, OTP, login alerts, account deletion).

## Getting started (local development)

### Prerequisites
- Python 3.11+, Node 20+
- PostgreSQL and Redis running locally

### Backend

```bash
cd backend
cp .env.example .env   # fill in real values
pip install -r requirements.txt
alembic upgrade head
python main.py          # boots Celery worker + FastAPI together
```

`main.py` starts the Celery worker as a managed subprocess and then runs
Uvicorn in the foreground — there's no need to run `celery worker` in a
separate terminal for local development.

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Set `VITE_API_URL` in `frontend/.env` to point at your backend (defaults to
the production Cloudflare tunnel URL).

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Deployment

The project ships as a single Docker image (see `Dockerfile`/`start.sh`) that
builds the frontend, serves it via nginx, runs the FastAPI backend and Celery
worker, and connects outbound through a Cloudflare Tunnel. `render.yaml`
deploys this image on Render; required secrets are `DATABASE_URL`,
`SECRET_KEY`, and `CLOUDFLARE_TUNNEL_TOKEN`.

## License

MIT — see [LICENSE](LICENSE).
