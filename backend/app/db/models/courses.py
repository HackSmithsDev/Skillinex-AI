from sqlalchemy import Column, String, ForeignKey, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..base import Base
from .user import UserCourse
import uuid

class Course(Base):
    """Level 1: The Main Container (e.g., 'Mastering FastAPI')"""
    __tablename__ = "courses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    category = Column(String(100))  # e.g., Web Development, Data Science
    thumbnail_url = Column(String(500)) # S3 link
    difficulty = Column(String(50))      # Beginner, Intermediate, Advanced
    created_at = Column(DateTime, default=func.now())
    
    enrolled_users = relationship("User", secondary=UserCourse.__table__, back_populates="enrolled_courses")
    sections = relationship("Section", back_populates="course", cascade="all, delete-orphan", order_by="Section.order")

class Section(Base):
    """Level 2: Module/Group (e.g., 'Authentication & Security')"""
    __tablename__ = "sections"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False) # Order within the course
    
    course = relationship("Course", back_populates="sections")
    lectures = relationship("Lecture", back_populates="section", cascade="all, delete-orphan", order_by="Lecture.order")


class Lecture(Base):
    """Level 3: The Actual Content (e.g., 'Implementing JWT Tokens')"""
    __tablename__ = "lectures"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id = Column(String, ForeignKey("sections.id"), nullable=False)
    title = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False) # Order within the section
    
    # Content
    video_url = Column(String(500))  # S3 or Video Link
    raw_text = Column(Text)            # For Markdown/Reading material
    
    quiz_data = Column(JSONB, nullable=True) 
    
    # Metadata for the UI
    estimated_minutes = Column(Integer, default=10) 

    section = relationship("Section", back_populates="lectures")