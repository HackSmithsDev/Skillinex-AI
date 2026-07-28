from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID

class LectureBase(BaseModel):
    title: str
    order: int
    content_type: str = "markdown"

class LectureOut(LectureBase):
    id: UUID
    section_id: UUID
    content: Optional[str] = None # The actual AI-generated study material
    
    model_config = ConfigDict(from_attributes=True)

class SectionBase(BaseModel):
    title: str
    order: int

class SectionOut(SectionBase):
    id: UUID
    course_id: UUID
    lectures: List[LectureOut] = []
    
    model_config = ConfigDict(from_attributes=True)

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: str = "Beginner"
    # We'll use this for the initial AI generation request
    prompt_topic: str 

class CourseOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    difficulty: str
    sections: List[SectionOut] = []
    
    model_config = ConfigDict(from_attributes=True)