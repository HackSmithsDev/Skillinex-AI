# Skillinex AI

Skillinex is a learning platform with a React web client, an Expo/React Native
mobile client, and a FastAPI backend. It provides course learning, AI-assisted
roadmaps and mentoring, quizzes, and a coding practice lab.

## Repository map

| Path | Purpose |
| --- | --- |
| `backend/` | FastAPI app, PostgreSQL models and Alembic migrations, Redis utilities, and Celery jobs |
| `frontend/` | React and Vite web application |
| `mobile/` | Expo / React Native application |
| `backend/uploads/` | Runtime-generated profile pictures and roadmap cache; not source-controlled |
| `Dockerfile`, `nginx.conf`, `start.sh` | Production container, web serving, migrations, API, worker, and optional tunnel |
| `render.yaml` | Render deployment blueprint |

The backend mounts its API routers at `/auth`, `/user`, `/study`, `/ai`, and
`/courses`. When it is running, its interactive API reference is at
`http://127.0.0.1:8008/docs`.

## Requirements

- Python 3.11
- Node.js 20 and npm
- PostgreSQL
- Redis

The backend needs PostgreSQL and Redis available for local development. AI
providers and email delivery also require their respective credentials when
using those features.

## Local development

### 1. Configure and run the backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set at least:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection; supports `postgresql+asyncpg://` and common `postgresql://` URLs |
| `REDIS_URL` | Redis connection used by Celery, OTPs, and temporary study sessions |
| `SECRET_KEY` | Private key for signing authentication tokens; generate a unique value, for example with `openssl rand -hex 32` |

Then, still in `backend/`, apply the schema and start the API:

```bash
alembic upgrade head
python main.py
```

`main.py` starts a Celery worker alongside Uvicorn. Keep PostgreSQL and Redis
running in their own processes. The example environment listens on
`127.0.0.1:8008`; set `FRONTEND_URL` to the web client's origin if it differs
from the allowed local origins. Configure `GROQ_API_KEY` and/or
`GEMINI_API_KEY` for AI features, and the `MAIL_*` variables for email
delivery. See `backend/.env.example` for all supported settings.

### 2. Run the web client

In a second terminal:

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

`frontend/.env.local` defaults to `http://localhost:8008` for the API. The Vite
development server prints its local URL when it starts.

### 3. Run the mobile client

In another terminal:

```bash
cd mobile
npm ci
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env`. Use `http://localhost:8008` for a
simulator that shares the host's loopback interface; for a physical device, use
the computer's reachable LAN address instead (for example,
`http://192.168.1.20:8008`).

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:8008 npx expo start
```

The Android and iOS native project directories are generated/ignored by the
Expo setup; use `npx expo run:android` or `npx expo run:ios` when native builds
are needed.

## Tests and checks

Backend tests:

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements-test.txt
pytest
```

Web checks:

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

`render.yaml` deploys the Docker image built from the repository root. The image
builds the web client, applies Alembic migrations at startup, and runs nginx,
FastAPI, and Celery. Configure the Render environment variables listed in
`render.yaml`, especially `DATABASE_URL`, `REDIS_URL`, and a unique
`SECRET_KEY`. Set `CLOUDFLARE_TUNNEL_TOKEN` if the deployment should expose the
web and API through the configured Cloudflare Tunnel. The root `.env.example`
contains only that optional tunnel token; local backend settings belong in
`backend/.env`.

The startup script now stops if migrations fail rather than bringing up the
application against an outdated schema.

## Generated and local files

Git ignores local `.env` files (but keeps `.env.example` templates), dependency
directories, build/test output, and `backend/uploads/`. Do not commit real
credentials or generated user data. Uploads are served at `/uploads/`; their
files are stored under `backend/uploads/` and omitted from the Docker build
context. Container filesystems may be ephemeral, so configure persistent
storage or an external object store if uploads must survive redeploys.

## License

MIT; see [LICENSE](LICENSE).
