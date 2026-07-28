import asyncio
from datetime import datetime
from fastapi_mail import FastMail, MessageSchema, MessageType
from app.workers.celery_app import celery_app
from app.core.config import settings
from .templates import (
    WELCOME_HTML, OTP_HTML, COURSE_READY_HTML, 
    LOGIN_ALERT_HTML, RESET_SUCCESS_HTML, 
    DELETE_ACCOUNT_HTML, SUPPORT_TICKET_HTML
)
from . import mail_config

async def _send_async_mail(message: MessageSchema):
    fm = FastMail(mail_config)
    await fm.send_message(message)

@celery_app.task(name="send_welcome_email")
def send_welcome_email(email: str, username: str):
    html = WELCOME_HTML.format(username=username, dashboard_url=f"{settings.FRONTEND_URL}/dashboard")
    message = MessageSchema(
        subject="Welcome to Skillinex! 🚀", recipients=[email],
        body=html, subtype=MessageType.html
    )
    asyncio.run(_send_async_mail(message))

@celery_app.task(name="send_otp_email")
def send_otp_email(email: str, username: str, code: str):
    html = OTP_HTML.format(username=username, code=code)
    message = MessageSchema(
        subject=f"{code} is your Skillinex code", recipients=[email],
        body=html, subtype=MessageType.html
    )
    asyncio.run(_send_async_mail(message))

@celery_app.task(name="send_course_ready_email")
def send_course_ready_email(email: str, course_title: str):
    html = COURSE_READY_HTML.format(
        course_title=course_title,
        link=f"{settings.FRONTEND_URL}/my-courses"
    )
    message = MessageSchema(
        subject=f"Your Course: {course_title} is Ready! 📚", recipients=[email],
        body=html, subtype=MessageType.html
    )
    asyncio.run(_send_async_mail(message))

@celery_app.task(name="send_login_alert")
def send_login_alert(email: str, username: str):
    html = LOGIN_ALERT_HTML.format(
        username=username, time=datetime.now().strftime('%b %d, %Y at %I:%M %p'),
        reset_url=f"{settings.FRONTEND_URL}/forgot-password"
    )
    message = MessageSchema(
        subject="Security Alert: New Login Detected 🛡️", recipients=[email],
        body=html, subtype=MessageType.html
    )
    asyncio.run(_send_async_mail(message))

@celery_app.task(name="send_reset_success_email")
def send_reset_success_email(email: str, username: str):
    html = RESET_SUCCESS_HTML.format(username=username)
    message = MessageSchema(
        subject="Password Reset Successful ✅", recipients=[email],
        body=html, subtype=MessageType.html
    )
    asyncio.run(_send_async_mail(message))

@celery_app.task(name="send_delete_account_email")
def send_delete_account_email(email: str, username: str):
    """Sends confirmation after account is purged."""
    html = DELETE_ACCOUNT_HTML.format(username=username)
    message = MessageSchema(
        subject="Account Successfully Deleted", recipients=[email],
        body=html, subtype=MessageType.html
    )
    asyncio.run(_send_async_mail(message))

@celery_app.task(name="send_support_ticket_email")
def send_support_ticket_email(email: str, username: str, issue_type: str, details: str):
    # User Notification
    user_html = SUPPORT_TICKET_HTML.format(username=username, issue_type=issue_type, details=details)
    user_msg = MessageSchema(
        subject=f"Ticket Received: {issue_type}", recipients=[email],
        body=user_html, subtype=MessageType.html
    )
    # Admin Alert
    admin_msg = MessageSchema(
        subject=f"NEW TICKET: {issue_type} from {username}",
        recipients=[settings.ADMIN_EMAIL],
        body=f"User: {username} ({email})\nType: {issue_type}\nDetails: {details}",
        subtype=MessageType.plain
    )
    asyncio.run(_send_async_mail(user_msg))
    asyncio.run(_send_async_mail(admin_msg))