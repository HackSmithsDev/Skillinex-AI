from sqlalchemy import Column, String, ForeignKey, Integer, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..base import Base
import uuid

class PracticeRecord(Base):
    """Tracks lecture completion and Lab session activity."""
    __tablename__ = "practice_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    lecture_id = Column(String, ForeignKey("lectures.id"), nullable=False)
    
    # NEW: Link to course to avoid deep-joining tables just to find course progress
    course_id = Column(String, ForeignKey("courses.id"), nullable=True) 
    
    # NEW: Track XP per activity for more granular achievements
    xp_earned = Column(Integer, default=10)
    
    status = Column(String(50), default="completed") 
    time_spent_seconds = Column(Integer, default=0)
    last_accessed = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # RELATIONSHIPS
    user = relationship("User", back_populates="practice_records")
    # Note: Ensure Course and Lecture models have corresponding relationships
    lecture = relationship("Lecture") 

class TestResult(Base):
    """Final Course Exams or AI-generated 'Neural Sync' Quizzes."""
    __tablename__ = "test_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    
    # NEW: Useful for the 'Skill_Log' to show exactly what was tested
    node_name = Column(String(100)) # e.g., "Data_Structures_v1"
    
    score = Column(Float, nullable=False) # Percentage (0-100)
    total_questions = Column(Integer)
    
    # AI Insight: Store missed concepts/strengths for the Personal Mentor
    analysis = Column(JSON) 
    
    completed_at = Column(DateTime, default=func.now())
    
    # RELATIONSHIPS
    user = relationship("User", back_populates="test_results")
    course = relationship("Course")