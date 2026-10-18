# Backend

The backend is a Python 3.11 FastAPI service. It uses PostgreSQL through
SQLAlchemy's async engine, Redis for temporary/session data and the Celery
broker, and Alembic for schema migrations.

## Local setup

From this directory:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` before starting the service:

- Set `DATABASE_URL` to a PostgreSQL connection string. `postgresql://` URLs
  are normalized for the async driver; Neon SSL and pooled URLs are supported.
- Set `REDIS_URL` to a reachable Redis instance.
- Set `SECRET_KEY` to a unique random secret (for example,
  `openssl rand -hex 32`); never use a shared or committed value.
- Configure `GROQ_API_KEY` and/or `GEMINI_API_KEY` for AI features.
- Configure the `MAIL_*` values for email delivery.

Run the database migrations and start the app:

```bash
alembic upgrade head
python main.py
```

`main.py` starts a Celery worker as a child process and then runs Uvicorn. It
uses `HOST`, `PORT`, and `WORKERS_COUNT` from the environment; the example
configuration uses `127.0.0.1:8008`. Keep PostgreSQL and Redis running in
separate processes. The API documentation is available at `/docs`.

## API and source layout

- `app/routers/` defines the `/auth`, `/user`, `/study`, `/ai`, and `/courses`
  API routers.
- `app/schemas/` contains request/response schemas.
- `app/db/models/` contains SQLAlchemy models; migration scripts are in
  `alembic/versions/`.
- `app/workers/` contains the Celery app and background tasks for AI roadmaps
  and email.
- `app/integrations/` contains the Groq and Gemini clients.

The app mounts runtime profile pictures and roadmap data at `/uploads`. The
files are stored under the ignored `backend/uploads/` directory:

- `backend/uploads/profile_pics/` contains user avatars.
- `backend/uploads/roadmaps/` contains generated roadmap JSON cache files.

The static URL structure stays `/uploads/profile_pics/...`, so existing avatar
URLs remain unchanged. Docker excludes local uploads and recreates the folders
at startup. A deployment's local filesystem may be ephemeral; use persistent
storage or an external object store if uploads must survive redeploys.

## Tests

```bash
python -m pip install -r requirements-test.txt
pytest
```

The test configuration is in `pytest.ini`; the suite covers API routes,
authentication, study flows, and lab/test submissions.

Do not commit `.env`, credentials, or generated files under `uploads/`.