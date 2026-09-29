import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.study import router as study_router
from app.routers.api import router as api_router
from app.core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        docs_url="/docs"
    )

    # 1. CORS Setup - Must be added before any other routes or mounts
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # 2. Guarantee CORS headers on all HTTP exceptions (including 401 & 403)
    @app.exception_handler(StarletteHTTPException)
    async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
        origin = request.headers.get("origin")
        headers = {}
        if origin and origin in settings.BACKEND_CORS_ORIGINS:
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers,
        )

    # 3. Static Files Mount
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))
    DATA_DIR = os.path.join(PROJECT_ROOT, "data")
    PROFILE_PICS_DIR = os.path.join(DATA_DIR, "profile_pics")
    ROADMAPS_DIR = os.path.join(DATA_DIR, "roadmaps")

    os.makedirs(PROFILE_PICS_DIR, exist_ok=True)
    os.makedirs(ROADMAPS_DIR, exist_ok=True)

    app.mount("/uploads", StaticFiles(directory=DATA_DIR), name="uploads")

    # 4. Routers
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

app = create_app()