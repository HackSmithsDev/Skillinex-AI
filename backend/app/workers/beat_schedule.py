from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    "cleanup-old-sessions": {
        "task": "app.workers.tasks.ai.cleanup",
        "schedule": crontab(hour=0, minute=0), # Every midnight
    },
}