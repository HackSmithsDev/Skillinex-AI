from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, List, Any
from uuid import UUID
from datetime import datetime

# --- 🆕 DYNAMIC COMPILER LAB SANDBOX SCHEMA SCHEMES ---

class DynamicExecuteRequest(BaseModel):
    """
    Validates execution matrix payloads. 
    'raw_context' is used by the AI service to map the specific environment.
    """
    raw_context: str = Field(..., description="The context name (e.g., course title or tool name) to resolve the runtime")
    code: str = Field(..., description="The source code to be executed in the Piston sandbox")


class UserEnvironmentOut(BaseModel):
    """
    Schema for environments populated in the frontend dropdown.
    """
    id: str = Field(..., description="Normalized Piston language ID (e.g., 'python', 'javascript')")
    display_name: str = Field(..., description="The original name of the course or tech stack item")
    origin: str = Field(..., description="Context source: 'Enrolled Course' or 'Profile Tech Stack'")

    model_config = ConfigDict(from_attributes=True)


# --- Practice Records (Lecture Completion) ---

class PracticeRecordCreate(BaseModel):
    lecture_id: UUID
    time_spent_seconds: int = 0
    status: str = "completed"


class PracticeRecordOut(PracticeRecordCreate):
    id: UUID
    last_accessed: datetime
    
    model_config = ConfigDict(from_attributes=True)


# --- Test Generation (Initialization) ---

class TestGenerateRequest(BaseModel):
    """Schema for POST /study/test/generate"""
    node: str
    depth: str
    units: int
    scope: str


class TestSessionOut(BaseModel):
    """Schema for GET /study/test/session/{id}"""
    id: str
    node_name: str
    questions: List[Dict[str, Any]]
    config: Dict[str, Any]
    
    model_config = ConfigDict(from_attributes=True)


# --- Test Results (Quiz/Exam Scoring) ---

class TestResultCreate(BaseModel):
    course_id: Optional[UUID] = None 
    node_name: str # Tracks the specific skill node (e.g., "AI Deployment")
    score: float
    total_questions: int
    analysis: Optional[Dict] = None 


class TestResultOut(BaseModel):
    id: str
    user_id: str
    node_name: str
    score: int
    total_questions: int
    analysis: Optional[Dict[str, Any]] = None
    course_id: Optional[str] = None
    completed_at: Optional[datetime] = None 

    model_config = ConfigDict(from_attributes=True)