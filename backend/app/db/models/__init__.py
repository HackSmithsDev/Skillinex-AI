from ..base import Base  # Your SQLAlchemy Declarative Base

from .user import User, UserLectureProgress, Feedback, UserCourse
from .courses import Course, Section, Lecture
from .study import PracticeRecord, TestResult
from .interaction import ChatSession, ChatMessage

# Exporting them so they are easily accessible
__all__ = [
    "Base",
    "User",
    "UserLectureProgress",
    "Feedback",
    "UserCourse",
    "Course",
    "Section",
    "Lecture",
    "PracticeRecord",
    "TestResult",
    "ChatSession",
    "ChatMessage",
]