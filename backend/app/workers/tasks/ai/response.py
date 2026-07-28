import asyncio
from app.workers.celery_app import celery_app
from app.integrations.groq import groq_client
from app.db.session import AsyncSessionLocal
from app.db.models.interaction import ChatMessage

@celery_app.task(name="process_mentor_response")
def process_mentor_response(session_id: str, user_message: str, context_lecture: str):
    """
    High-speed Mentor feedback loop.
    Uses Groq (Llama 3.3 70B) for near-instant responses.
    """
    loop = asyncio.get_event_loop()
    
    # 1. Generate the Mentor's response
    system_prompt = (
        f"You are a Senior Technical Mentor at Skillinex. "
        f"The student is currently studying: {context_lecture}. "
        "Explain concepts simply but deeply. Be encouraging but direct."
    )
    
    ai_response = loop.run_until_complete(
        groq_client.get_chat_response(system_prompt, user_message)
    )

    # 2. Save the interaction to the database
    async def save_chat():
        async with AsyncSessionLocal() as db:
            new_msg = ChatMessage(
                session_id=session_id,
                content=ai_response,
                role="assistant"
            )
            db.add(new_msg)
            await db.commit()

    loop.run_until_complete(save_chat())
    return {"status": "replied", "response": ai_response}