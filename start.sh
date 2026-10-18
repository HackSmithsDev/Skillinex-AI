#!/bin/sh
set -eu

: "${PORT:=8080}"

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL must be configured" >&2
    exit 1
fi

# Track child PIDs for cleanup
celery_pid=""
uvicorn_pid=""
tunnel_pid=""

cleanup() {
    status=$?
    trap - EXIT INT TERM
    echo "Shutting down all services..."
    [ -n "$uvicorn_pid" ] && kill -TERM "$uvicorn_pid" 2>/dev/null || true
    [ -n "$celery_pid" ] && kill -TERM "$celery_pid" 2>/dev/null || true
    [ -n "$tunnel_pid" ] && kill -TERM "$tunnel_pid" 2>/dev/null || true
    nginx -s quit 2>/dev/null || true
    wait || true
    exit "$status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# 1. Run Alembic Migrations
echo "[1/5] Applying database migrations..."
cd /app/backend
alembic upgrade head
cd /app

# 2. Configure & Start Nginx (Frontend on 5174, Render Healthcheck on $PORT)
echo "[2/5] Configuring and starting Nginx on port ${PORT}..."
sed -i "s/listen 8080 default_server;/listen ${PORT} default_server;/g" /etc/nginx/nginx.conf
nginx

# 3. Start Celery Worker
echo "[3/5] Starting Celery worker..."
cd /app/backend
celery -A app.workers.celery_app worker --loglevel=info --concurrency="${CELERY_CONCURRENCY:-2}" &
celery_pid=$!
cd /app

# 4. Start FastAPI
echo "[4/5] Starting FastAPI on 127.0.0.1:8008..."
cd /app/backend
uvicorn app:app --host 127.0.0.1 --port 8008 --workers "${WEB_CONCURRENCY:-2}" &
uvicorn_pid=$!
cd /app

# 5. Generate Valid Cloudflare Tunnel Config & Run
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

if [ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    echo "[5/5] Connecting Cloudflare Tunnel..."
    cloudflared tunnel --no-autoupdate --config /etc/cloudflared/config.yml run --token "$CLOUDFLARE_TUNNEL_TOKEN" &
    tunnel_pid=$!
else
    echo "[5/5] CLOUDFLARE_TUNNEL_TOKEN not set; serving local only."
fi

# Supervise Uvicorn process
wait "$uvicorn_pid"