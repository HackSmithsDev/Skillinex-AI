# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ENV VITE_API_URL=https://skillinex-api.hacksmiths.dev
RUN npm run build

# Stage 2: Production Python Runtime + Nginx + cloudflared
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    nginx \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install cloudflared binary
RUN curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o /usr/local/bin/cloudflared \
    && chmod +x /usr/local/bin/cloudflared

WORKDIR /app

# Backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --upgrade pip \
    && pip install -r backend/requirements.txt uvicorn[standard]

# Copy Application Source
COPY backend/ ./backend/
# backend/uploads/ is intentionally not copied; app startup creates its directories.
RUN mkdir -p ./backend/uploads/profile_pics ./backend/uploads/roadmaps
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080 5174 8008

CMD ["/app/start.sh"]