from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "skillinex_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.tasks.roadmap.generator",
        "app.workers.tasks.ai.pdf_engine",
        "app.workers.tasks.email.sender"
    ]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    
    # --- 1. THE AI SAFETIES ---
    task_time_limit=900,        # Increased from 300 to 900 seconds (15 mins)
    worker_concurrency=1,       # Decreased from 4 to 1 for your local dev environment
    
    # --- Existing Optimal Configuration ---
    worker_prefetch_multiplier=1
)