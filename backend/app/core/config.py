from typing import List, Optional
from urllib.parse import urlsplit, urlunsplit
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
    SECRET_KEY: str = "16279b47e2260d3b0b59cbcf218a2a83468f9fd136d16c41c232f93c440c8b8a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Database & Redis
    # Accepts either a Neon-style pooled URL (postgres:// or postgresql://, with
    # ?sslmode=require&channel_binding=require) or a plain local Postgres URL —
    # both are normalized below without needing separate config per environment.
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/skillinex"
    REDIS_URL: str = "redis://localhost:6379/0"  # Also accepts Upstash-style rediss:// URLs

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        if url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]

        # asyncpg's DSN parser doesn't understand libpq-only query params
        # (sslmode, channel_binding) that Neon appends — strip them here and
        # apply SSL via connect_args instead (see DATABASE_REQUIRES_SSL).
        parts = urlsplit(url)
        if parts.query:
            url = urlunsplit(parts._replace(query=""))
        return url

    @property
    def DATABASE_REQUIRES_SSL(self) -> bool:
        marker_url = self.DATABASE_URL.lower()
        return "sslmode=require" in marker_url or "channel_binding=require" in marker_url or ".neon.tech" in marker_url

    @property
    def DATABASE_IS_POOLED(self) -> bool:
        # Neon's "-pooler" endpoint routes through PgBouncer (transaction mode),
        # which breaks asyncpg's server-side prepared statement cache unless disabled.
        return "-pooler." in self.DATABASE_URL.lower()

    # AI Integration Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # SMTP Configuration — flags let this target Gmail (STARTTLS/587) or a
    # provider like GoDaddy's smtpout.secureserver.net (SSL/465) via env only.
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_FROM_NAME: str = "Skillinex AI"
    MAIL_PORT: int = 587
    MAIL_SERVER: Optional[str] = None
    MAIL_USE_TLS: bool = True   # STARTTLS, typically port 587
    MAIL_USE_SSL: bool = False  # Direct SSL, typically port 465

    # Cloudflare Tunnel — only used by the Docker/Render entrypoint (start.sh);
    # local dev instead uses the cloudflared config file + credentials JSON.
    CLOUDFLARE_TUNNEL_TOKEN: Optional[str] = None

    # Admin Monitoring — recipient for support-ticket alerts (send_support_ticket_email)
    ADMIN_EMAIL: str = "admin@hacksmiths.dev"

    # Frontend / CORS Logic
    FRONTEND_URL: str = "https://skillinex.hacksmiths.dev"

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        base_origins = [
            self.FRONTEND_URL,
            "https://skillinex.hacksmiths.dev",
            "https://skillinex-api.hacksmiths.dev",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
        return list(dict.fromkeys(base_origins))

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
        env_file_encoding="utf-8",
    )

settings = Settings()