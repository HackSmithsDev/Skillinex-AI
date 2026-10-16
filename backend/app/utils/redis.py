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

# --- LAB TASK CACHE LOGIC ---
async def set_active_lab_task(user_id: str, data: Any, expire_seconds: int = 86400):
    """Caches the dynamic lab challenge for 24 hours."""
    await redis_client.set(f"lab:active:{user_id}", json.dumps(data), ex=expire_seconds)

async def get_active_lab_task(user_id: str) -> Optional[Any]:
    """Retrieves the cached active lab challenge."""
    raw_data = await redis_client.get(f"lab:active:{user_id}")
    return json.loads(raw_data) if raw_data else None

async def delete_active_lab_task(user_id: str):
    """Clears the active lab challenge."""
    await redis_client.delete(f"lab:active:{user_id}")


async def set_verified_lab_run(user_id: str, task_id: str, expire_seconds: int = 300):
    """Records a successful sandbox run for a short-lived, server-verified reward."""
    await redis_client.set(f"lab:verified:{user_id}", task_id, ex=expire_seconds)


async def consume_verified_lab_run(user_id: str) -> Optional[str]:
    """Atomically consumes a verified run so it cannot be replayed."""
    return await redis_client.getdel(f"lab:verified:{user_id}")


async def claim_lab_reward(user_id: str, task_id: str, expire_seconds: int = 86400) -> bool:
    """Allows XP to be claimed only once for a task during its cache lifetime."""
    claimed = await redis_client.set(
        f"lab:rewarded:{user_id}:{task_id}",
        "1",
        ex=expire_seconds,
        nx=True,
    )
    return bool(claimed)


async def release_lab_reward_claim(user_id: str, task_id: str):
    """Releases a reward claim if persisting the XP update fails."""
    await redis_client.delete(f"lab:rewarded:{user_id}:{task_id}")