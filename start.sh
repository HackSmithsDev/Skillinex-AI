#!/bin/sh
set -eu

: "${PORT:=8080}"

if [ -z "${DATABASE_URL:-}" ] && [ -z "${DATABASE_URI:-}" ]; then
    echo "DATABASE_URL or DATABASE_URI must be configured" >&2
    exit 1
fi

# 1. Run Alembic Migrations
echo "Applying database migrations..."
cd /app/backend
alembic upgrade head || echo "Alembic migrations completed or skipped."
cd /app

# 2. Configure & Start Nginx (serves frontend/dist on 5174, health check on $PORT)
sed -i "s/listen 8080 default_server;/listen ${PORT} default_server;/g" /etc/nginx/nginx.conf
echo "Starting Nginx on port ${PORT}..."
nginx

# 3. Start Celery Worker (background jobs: roadmap generation, emails)
echo "Starting Celery worker..."
cd /app/backend
celery -A app.workers.celery_app worker --loglevel=info --concurrency="${CELERY_CONCURRENCY:-2}" &
celery_pid=$!
cd /app

# 4. Start FastAPI (backend/app:app)
echo "Starting FastAPI on 127.0.0.1:8008..."
cd /app/backend
uvicorn app:app --host 127.0.0.1 --port 8008 --workers "${WEB_CONCURRENCY:-2}" &
uvicorn_pid=$!
cd /app

# 5. Generate Cloudflare Tunnel Configuration
mkdir -p /etc/cloudflared
cat << 'EOF' > /etc/cloudflared/config.yml
protocol: http2
ingress:
  - hostname: skillinex.hacksmiths.dev
    service: http://127.0.0.1:5174
  - hostname: skillinex-api.hacksmiths.dev
    service: http://127.0.0.1:8008
  - service: http_status:404
EOF

# 6. Start Cloudflare Tunnel
if [ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    echo "Connecting Cloudflare Tunnel for skillinex.hacksmiths.dev..."
    cloudflared tunnel --no-autoupdate --config /etc/cloudflared/config.yml run --token "$CLOUDFLARE_TUNNEL_TOKEN" &
    tunnel_pid=$!
else
    echo "CLOUDFLARE_TUNNEL_TOKEN not set; serving local only."
fi

# Shut down the worker too if the main process is stopped
trap 'kill "$celery_pid" 2>/dev/null || true' EXIT

# Keep container alive supervising Uvicorn
wait "$uvicorn_pid"