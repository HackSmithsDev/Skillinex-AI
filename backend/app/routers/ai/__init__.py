from .routes import router as ai_router
from fastapi import APIRouter

router = APIRouter()
router.include_router(ai_router)