from fastapi import APIRouter
from .profile import router as profile_router
from .dashboard import router as dashboard_router
from .achievements import router as achievement_router

router = APIRouter()

router.include_router(profile_router, tags=["Profile"])
router.include_router(dashboard_router, tags=["Dashboard"])
router.include_router(achievement_router, prefix="/achievements", tags=["Gamification"])