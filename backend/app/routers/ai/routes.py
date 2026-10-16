from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models import ChatSession, ChatMessage, User
from app.schemas import (
    ChatSessionOut, ChatSessionCreate, 
    ChatMessageCreate, ChatMessageOut
)
from app.workers.tasks.ai import (
    generate_mentor_response, 
    generate_session_title_task
)

router = APIRouter()

@router.post("/sessions", response_model=ChatSessionOut)
async def create_session(
    session_in: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
    # 1. Verify session ownership and load past dialogue
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.id == str(message_in.session_id))
        .where(ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.messages))
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session node not found")

    is_first_interaction = len(session.messages) == 0

    # 2. Generate response via response.py and feed.py
    try:
        ai_content = await generate_mentor_response(
            user_name=current_user.full_name or "Engineer",
            tech_stack=current_user.tech_stack,
            raw_history=session.messages,
            current_message=message_in.content,
            window_size=6
        )

        user_msg = ChatMessage(session_id=session.id, role="user", content=message_in.content)
        ai_msg = ChatMessage(session_id=session.id, role="assistant", content=ai_content)
        db.add_all([user_msg, ai_msg])

        # 3. Queue background title synthesis if new session
        if is_first_interaction:
            generate_session_title_task.delay(str(session.id), message_in.content)

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
    result = await db.execute(select(ChatMessage).where(ChatMessage.id == str(message_id)))
    msg = result.scalars().first()
    if msg:
        msg.is_helpful = helpful
        await db.commit()
        return {"status": "synced"}
    else:
        raise HTTPException(status_code=404, detail="Message not found")