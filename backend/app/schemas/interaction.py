from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ChatMessageBase(BaseModel):
    content: str
    role: str # "user" or "assistant"

class ChatMessageCreate(BaseModel):
    content: str
    session_id: UUID

class ChatMessageOut(ChatMessageBase):
    id: UUID
    created_at: datetime
    is_helpful: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Mentorship Session"

class ChatSessionOut(ChatSessionCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    # Nested messages for the full chat view
    messages: List[ChatMessageOut] = []
    
    model_config = ConfigDict(from_attributes=True)