from fastapi_mail import ConnectionConfig
from app.core.config import settings

# 1. SMTP Connection Configuration
# Centralized settings for FastAPI-Mail across all worker tasks.
mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME="Skillinex AI",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False, # Standard for port 587; set to True if using port 465
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# 2. Task Exposure
# Importing tasks from .sender to make them available via app.workers.tasks.email
from .sender import (
    send_welcome_email,
    send_otp_email,
    send_course_ready_email,
    send_login_alert,
    send_reset_success_email,
    send_delete_account_email,
    send_support_ticket_email
)

# 3. Clean Namespace
# Ensuring only the tasks are exposed when importing the module
__all__ = [
    "mail_config",
    "send_welcome_email",
    "send_otp_email",
    "send_course_ready_email",
    "send_login_alert",
    "send_reset_success_email",
    "send_delete_account_email",
    "send_support_ticket_email"
]