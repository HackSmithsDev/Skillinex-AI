from sqlalchemy.ext.declarative import declarative_base

# The single Source of Truth for all models
Base = declarative_base()

# Import all models so they attach to Base.metadata for Alembic migrations
from app.db.models.user import User, Feedback
from app.db.models.courses import Course, Section, Lecture
from app.db.models.study import PracticeRecord, TestResult
from app.db.models.interaction import ChatSession, ChatMessage

# This is what Alembic's env.py will point to
metadata = Base.metadata