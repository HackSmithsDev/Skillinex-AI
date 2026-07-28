# 1. User & Auth
from .user import (
    LoginRequest, UserCreate, UserOut, UserUpdate, 
    DashboardCourse, Goal, DashboardStats, DashboardOut,
    Token, PasswordChange, PasswordResetRequest, 
    PasswordResetConfirm, AccountDeleteRequest
)

# 2. Universal Courses
from .course import CourseCreate, CourseOut, SectionOut, LectureOut

# 3. AI Chat & Mentorship
from .interaction import (
    ChatMessageCreate, ChatMessageOut, 
    ChatSessionCreate, ChatSessionOut
)

# 4. Study Progress
from .study import (
    PracticeRecordCreate, PracticeRecordOut, 
    TestGenerateRequest, TestSessionOut,
    TestResultCreate, TestResultOut
)

__all__ = [
    "LoginRequest", "UserCreate", "UserOut",
    "UserUpdate", "DashboardCourse", "Goal", 
    "DashboardStats", "DashboardOut",
    "Token", "PasswordChange", 
    "PasswordResetRequest", "PasswordResetConfirm", 
    "AccountDeleteRequest", "CourseCreate", 
    "CourseOut", "SectionOut", "LectureOut",
    "ChatMessageCreate", "ChatMessageOut",
    "ChatSessionCreate", "ChatSessionOut",
    "PracticeRecordCreate", "PracticeRecordOut", 
    "TestGenerateRequest", "TestSessionOut",
    "TestResultCreate", "TestResultOut"
]