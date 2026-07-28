from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime

# --- Identity Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    # ⚡ Adjusted to match required onboarding variables passed from your new wizard view
    bio: Optional[str] = Field("", max_length=500, description="User bio/profile statement")
    photo_url: Optional[str] = Field(None, max_length=500, description="Avatar image matrix link")
    age: int = Field(..., ge=10, le=100, description="Validated demographic parameters")
    gender: str = Field(..., max_length=50, description="Targeted identity category")
    
    tech_stack: Dict[str, str] = Field(default_factory=dict)

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    photo_url: Optional[str] = Field(None, max_length=500)
    age: Optional[int] = Field(None, ge=10, le=100)
    gender: Optional[str] = Field(None, max_length=50)
    tech_stack: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: Union[UUID, str]  # Safe serialization for both string and UUID formats
    
    bio: Optional[str] = ""
    photo_url: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    xp_points: int = 0
    is_active: bool
    tech_stack: Optional[Dict[str, str]] = Field(default_factory=dict)
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Dashboard & Progress Schemas ---

class DashboardCourse(BaseModel):
    """Schema for the active course displayed on the dashboard."""
    id: Union[UUID, str]
    title: str
    progress: int
    completedLectures: int
    totalLectures: int
    difficulty: str
    thumbnail_url: Optional[str] = None
    timeLeft: str

class Goal(BaseModel):
    label: str
    done: bool

class DashboardStats(BaseModel):
    """Schema for user stats on the home screen."""
    name: str
    totalXP: int
    topCategory: str
    avgScore: int
    dailyGoalStatus: str
    goals: List[Goal]

class DashboardOut(BaseModel):
    """Final response schema for GET /user/dashboard"""
    stats: DashboardStats
    currentCourse: Optional[DashboardCourse] = None

# --- Auth & Security Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str = Field(..., pattern=r"^\d{6}$") 
    new_password: str = Field(..., min_length=8)

class AccountDeleteRequest(BaseModel):
    password: str