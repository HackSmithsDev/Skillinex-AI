from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.study import router as study_router
from app.routers.ai import router as ai_router
from app.routers.courses import router as courses_router
from app.core.config import settings
from app.core.storage import PROFILE_PICS_DIR, ROADMAPS_DIR, UPLOADS_DIR

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
    PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
    ROADMAPS_DIR.mkdir(parents=True, exist_ok=True)

    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

    # 4. Routers
    app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    app.include_router(user_router, prefix="/user", tags=["User Dashboard"])
    app.include_router(study_router, prefix="/study", tags=["Learning & Progress"])
    app.include_router(ai_router, prefix="/ai", tags=["AI Core Services"])
    app.include_router(courses_router, prefix="/courses", tags=["Courses"])

    @app.get("/")
    async def root():
        return {
            "status": "Skillinex Backend Online",
            "environment": "Development",
            "docs": "/docs"
        }

    return app

app = create_app()