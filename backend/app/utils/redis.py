import json
import redis.asyncio as redis
from typing import Any, Optional
from app.core.config import settings

# Initialize Redis
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# --- OTP LOGIC (Your Existing Code) ---
async def set_otp(email: str, code: str, expire_seconds: int = 600):
    await redis_client.set(f"otp:{email}", code, ex=expire_seconds)

async def get_otp(email: str):
    return await redis_client.get(f"otp:{email}")

async def delete_otp(email: str):
    await redis_client.delete(f"otp:{email}")

# --- TEST SESSION LOGIC (New Extensions) ---
async def set_session_data(session_id: str, data: Any, expire_seconds: int = 3600):
    """Stores dict/list data as JSON for the Skill Terminal."""
    await redis_client.set(f"session:{session_id}", json.dumps(data), ex=expire_seconds)

async def get_session_data(session_id: str) -> Optional[Any]:
    """Retrieves and decodes JSON session data."""
    raw_data = await redis_client.get(f"session:{session_id}")
    return json.loads(raw_data) if raw_data else None

async def delete_session(session_id: str):
    """Wipes session from memory after submission or cancellation."""
    await redis_client.delete(f"session:{session_id}")