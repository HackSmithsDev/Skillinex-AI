from typing import List
from pydantic import BaseModel, Field

class QuizItem(BaseModel):
    question: str
    option1: str
    option2: str
    option3: str
    option4: str
    answer: str = Field(pattern="^option[1-4]$")
    difficulty: str = Field(description="Difficulty level of the question (e.g., Beginner, Intermediate, Advanced).")

class LectureContentSchema(BaseModel):
    """Phase 2: Full content for one lecture"""
    raw_text: str = Field(description="Comprehensive markdown technical guide (approx 500-1000 words).")
    video_query: str = Field(description="A specific search query to find a high-quality YouTube tutorial for this topic.")
    quizzes: List[QuizItem] = Field(min_length=5, description="A list of challenging MCQs.")
    estimated_minutes: int = Field(default=15, description="Estimated time to complete this lecture.")

class SectionSkeleton(BaseModel):
    """Phase 1: Section details"""
    title: str
    lecture_titles: List[str] = Field(description="Organic list of lectures required to cover this section.")

class CourseSkeleton(BaseModel):
    """Phase 1: High-level roadmap metadata"""
    title: str = Field(description="Refined professional course title.")
    category: str = Field(description="Main tech category.")
    description: str = Field(description="2-line punchy summary.")
    sections: List[SectionSkeleton] = Field(description="Dynamic number of sections based on topic depth.")