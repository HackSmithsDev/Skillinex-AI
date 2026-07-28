from sqlalchemy import Boolean, Column, String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..base import Base
import uuid

class ChatSession(Base):
    """
    Groups a series of messages together. 
    A user can have multiple sessions (e.g., 'Career Advice', 'Python Help').
    """
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255)) # AI can auto-generate this title after first message
    
    # Context: Store any specific tech-stack or goal this session is focused on
    context_metadata = Column(JSON) 
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    """
    Individual messages within a session.
    Stores both the Human and AI responses.
    """
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    
    role = Column(String(20)) # "user", "assistant", or "system"
    content = Column(Text, nullable=False)
    
    # Analytics: Did the user like this specific answer?
    is_helpful = Column(Boolean, default=None, nullable=True) 
    
    created_at = Column(DateTime, default=func.now())
    
    session = relationship("ChatSession", back_populates="messages")