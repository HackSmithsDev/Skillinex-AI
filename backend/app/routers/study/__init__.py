from fastapi import APIRouter
from .tutorials import router as tutorials_router
from .practice import router as practice_router
from .test import router as test_router

router = APIRouter()

# Include sub-routers with specific prefixes
router.include_router(tutorials_router, prefix="/tutorials", tags=["Study - Tutorials"])
router.include_router(practice_router, prefix="/practice", tags=["Study - Practice"])
router.include_router(test_router, prefix="/test", tags=["Study - Tests"])