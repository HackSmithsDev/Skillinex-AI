import os  #  need this for path resolution
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # 🆕 For mounting the file system volumes

# Import all modular routers from your directory tree
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.study import router as study_router
from app.routers.api import router as api_router

from app.core.config import settings

def create_app() -> FastAPI:
    """Factory to create the Skillinex FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        docs_url="/docs"
    )

    # 1. CORS Setup - Using your .env origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 🆕 1b. Static Files Mount for Shared Volumes (Root Data Folder)
    # Calculates path cleanly from: backend/app/__init__.py -> backend/ -> project_root/data
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))
    DATA_DIR = os.path.join(PROJECT_ROOT, "data")
    PROFILE_PICS_DIR = os.path.join(DATA_DIR, "profile_pics")
    ROADMAPS_DIR = os.path.join(DATA_DIR, "roadmaps")

    # Double check that file folders are ready to receive data streams
    os.makedirs(PROFILE_PICS_DIR, exist_ok=True)
    os.makedirs(ROADMAPS_DIR, exist_ok=True)

    # Expose the local data disk block to the network under /uploads
    app.mount("/uploads", StaticFiles(directory=DATA_DIR), name="uploads")


    # 2. Register Modular Routers
    # Auth handles signup/login
    app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    app.include_router(user_router, prefix="/user", tags=["User Dashboard"])
    app.include_router(study_router, prefix="/study", tags=["Learning & Progress"])
    app.include_router(api_router, prefix="/api", tags=["AI Core Services"])

    @app.get("/")
    async def root():
        return {
            "status": "Skillinex Backend Online",
            "environment": "Development",
            "docs": "/docs"
        }

    return app

# Initialize the instance for Uvicorn
app = create_app()