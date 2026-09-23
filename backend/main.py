import atexit
import subprocess
import sys

import uvicorn
from app.core.config import settings

_celery_process: subprocess.Popen | None = None


def _start_celery_worker() -> subprocess.Popen:
    """Launch the Celery worker as a managed subprocess alongside the API server."""
    cmd = [
        sys.executable, "-m", "celery",
        "-A", "app.workers.celery_app", "worker",
        "--loglevel=info",
        "-P", "solo",  # 'solo' pool keeps this friendly for macOS/Windows dev machines
    ]
    return subprocess.Popen(cmd)


def _stop_celery_worker() -> None:
    global _celery_process
    if _celery_process and _celery_process.poll() is None:
        _celery_process.terminate()
        try:
            _celery_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            _celery_process.kill()
    _celery_process = None


def start_server():
    """
    Entry point for the Skillinex platform. Boots the Celery worker in the
    background, then runs the FastAPI server in the foreground. Killing this
    process (Ctrl+C) shuts down both cleanly — no separate `celery worker`
    command required.
    """
    global _celery_process
    _celery_process = _start_celery_worker()
    atexit.register(_stop_celery_worker)

    try:
        uvicorn.run(
            "app:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info",
            workers=settings.WORKERS_COUNT if not settings.DEBUG else 1,
            proxy_headers=True,               # <-- CRITICAL for Cloudflare Tunnels
            forwarded_allow_ips="*"           # <-- Trust Cloudflare edge proxy IPs
        )
    finally:
        _stop_celery_worker()


if __name__ == "__main__":
    start_server()