from typing import List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # --- Server Config ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    WORKERS_COUNT: int = 4
    
    PROJECT_NAME: str = "Skillinex"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 

    # Database & Redis
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

    # AI Integration Keys
    GROQ_API_KEY: str
    GEMINI_API_KEY: str

    # SMTP Configuration
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: Optional[str] = None

    # Frontend / CORS Logic
    FRONTEND_URL: str = "http://localhost:5174"
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        # Allows us to handle multiple origins if needed later
        return [self.FRONTEND_URL]

    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()