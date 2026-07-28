from sqlalchemy import Column, String, Boolean, JSON, Integer, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..base import Base
import uuid

class UserCourse(Base):
    """Association Model for the Many-to-Many relationship."""
    __tablename__ = "user_courses"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    course_id = Column(String, ForeignKey("courses.id"), primary_key=True)
    enrolled_at = Column(DateTime, default=func.now())


class User(Base):
    """The core Identity model for Skillinex."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    
    # 🆕 NEW DATA LAYER: PROFILE METADATA
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)  # e.g., "Male", "Female", "Non-binary", "Prefer not to say"
    
    # GAMIFICATION ENGINE
    xp_points = Column(Integer, default=0)
    # Flexible JSON for tech stacks (ideal for dynamic developer scenes)
    # Format: {"Python": "Pro", "FastAPI": "Intermediate", "PostgreSQL": "Beginner"}
    tech_stack = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=func.now())

    # RELATIONSHIPS
    enrolled_courses = relationship(
        "Course", 
        secondary=UserCourse.__table__, 
        back_populates="enrolled_users"
    )
    
    # Tracking the "Neural Syncs" and "Lab Sessions"
    lecture_progress = relationship("UserLectureProgress", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user")
    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")
    practice_records = relationship("PracticeRecord", back_populates="user", cascade="all, delete-orphan")
    

class UserLectureProgress(Base):
    """Tracks individual progress per lecture."""
    __tablename__ = "user_lecture_progress"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    lecture_id = Column(String, ForeignKey("lectures.id"), nullable=False)
    
    # PROGRESS TRACKING
    is_completed = Column(Boolean, default=False)
    last_watched_second = Column(Integer, default=0) 
    notes_read = Column(Boolean, default=False)      
    quiz_score = Column(Integer, nullable=True)     
    
    last_accessed = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Standardized back_populates
    user = relationship("User", back_populates="lecture_progress")


class Feedback(Base):
    """User reviews for Courses or AI Roadmap accuracy."""
    __tablename__ = "feedbacks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer) 
    comment = Column(Text)
    context = Column(String(100)) 
    created_at = Column(DateTime, default=func.now())
    
    user = relationship("User", back_populates="feedbacks")