from pydantic import BaseModel, Field
from typing import Optional, List


class LabChallengeSchema(BaseModel):
    """
    Validated structure for a generated lab task created by the AI engine.
    """
    task_id: str = Field(..., description="Unique slug for the lab challenge")
    topic: str = Field(..., description="The course title or tech stack node")
    title: str = Field(..., description="Tactical name of the lab challenge")
    difficulty: str = Field(default="Intermediate", description="Beginner, Intermediate, or Advanced")
    description: str = Field(..., description="Core objective and problem requirements")
    target_criteria: str = Field(..., description="Expected output or condition representing success")
    language: str = Field(..., description="Target runtime string (e.g. python, bash, javascript, cpp, go)")
    starter_code: str = Field(..., description="Boilerplate function/script with instructions")
    test_harness: str = Field(..., description="Assertion/test code appended to verify user code prints 1 on success")


class LabGenerationRequest(BaseModel):
    user_id: str
    topic: str
    difficulty: Optional[str] = "Intermediate"
    force_refresh: Optional[bool] = False