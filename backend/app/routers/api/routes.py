from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

# Fixed Imports based on your Auth Reference
from app.db.session import get_db
from app.db.models import ChatSession, ChatMessage, User
from app.schemas import (
    ChatSessionOut, ChatSessionCreate, 
    ChatMessageCreate, ChatMessageOut
)
from app.integrations.groq import groq_client
from app.core.security import get_current_user # Adjust path if different

router = APIRouter()

@router.post("/sessions", response_model=ChatSessionOut)
async def create_session(
    session_in: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initializes a new neural mentorship session."""
    new_session = ChatSession(
        user_id=current_user.id,
        title=session_in.title or "New Mentorship Session",
        context_metadata={"tech_stack": current_user.tech_stack}
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

@router.get("/sessions", response_model=List[ChatSessionOut])
async def get_user_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all past dialogue sessions."""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
    )
    return result.scalars().all()

@router.post("/message", response_model=ChatMessageOut)
async def send_message(
    message_in: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Processes a message through Groq and persists the interaction."""
    
    # 1. Verify session ownership and load messages
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.id == str(message_in.session_id))
        .where(ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.messages))
    )
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session node not found")

    # 2. Extract recent history (last 6 messages)
    history = [
        {"role": m.role, "content": m.content} 
        for m in session.messages[-6:]
    ]

    # 3. Request AI Response
    try:
        user_level = current_user.tech_stack.get('level', 'Engineer')
        system_prompt = {
            "role": "system",
            "content": f"You are CogniLit AI. User: {current_user.full_name}, Level: {user_level}. "
                       "Provide precise, technical guidance. Format with Markdown."
        }
        
        messages = [system_prompt] + history + [{"role": "user", "content": message_in.content}]
        ai_content = await groq_client.get_chat_response(messages)

        # 4. Persistence
        user_msg = ChatMessage(
            session_id=session.id,
            role="user",
            content=message_in.content
        )
        ai_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=ai_content
        )

        # Update title if it's a new session
        if len(session.messages) < 2:
            session.title = message_in.content[:40] + "..."

        db.add_all([user_msg, ai_msg])
        await db.commit()
        await db.refresh(ai_msg)
        
        return ai_msg

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Neural link failure: {str(e)}")

@router.patch("/message/{message_id}/feedback")
async def rate_message(
    message_id: UUID,
    helpful: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates AI response helpfulness."""
    result = await db.execute(select(ChatMessage).where(ChatMessage.id == str(message_id)))
    msg = result.scalars().first()
    
    if msg:
        msg.is_helpful = helpful
        await db.commit()
        
    return {"status": "synced"}