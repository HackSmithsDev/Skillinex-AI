import logging
from typing import List, Dict, Any
from app.integrations.groq import groq_client
from app.workers.celery_app import celery_app
from .feed import assemble_context_feed
from .prompt import build_title_prompt

logger = logging.getLogger(__name__)


async def generate_mentor_response(
    user_name: str,
    tech_stack: Dict[str, Any] | None,
    raw_history: List[Any],
    current_message: str,
    window_size: int = 6
) -> str:
    """
    Builds the assembled dialogue feed and calls Groq to generate the final mentor response.
    """
    payload = assemble_context_feed(
        user_name=user_name,
        tech_stack=tech_stack,
        raw_history=raw_history,
        current_message=current_message,
        window_size=window_size
    )
    
    try:
        reply = await groq_client.get_chat_response(payload)
        return reply.strip()
    except Exception as exc:
        logger.error(f"[AI Response] Failed to generate mentor response: {exc}", exc_info=True)
        raise exc


@celery_app.task(name="app.workers.tasks.ai.response.generate_session_title_task", max_retries=1)
def generate_session_title_task(session_id: str, first_message: str) -> str:
    """
    Background Celery task: Generates a concise title using Groq and updates the ChatSession table.
    """
    import asyncio
    from app.db.session import async_session_maker
    from app.db.models import ChatSession
    from sqlalchemy.future import select

    async def _run_update():
        title_payload = build_title_prompt(first_message)
        try:
            raw_title = await groq_client.get_chat_response(title_payload)
            title = raw_title.strip().replace('"', '')[:45]
        except Exception:
            title = first_message[:30] + "..."

        async with async_session_maker() as db:
            result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
            session = result.scalars().first()
            if session:
                session.title = title
                await db.commit()
        return title

    try:
        return asyncio.run(_run_update())
    except Exception as e:
        logger.warning(f"[AI Response] Session title background generation failed: {e}")
        return first_message[:30] + "..."