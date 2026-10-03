import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models import User, Course
from app.db.models.user import UserCourse
from app.workers.tasks.roadmap.generator import generate_full_curriculum

router = APIRouter()


class CourseGenerateRequest(BaseModel):
    prompt_topic: str = Field(..., min_length=2, max_length=200)
    difficulty: str = "Beginner"


@router.post("/generate", status_code=202)
async def generate_course(
    data: CourseGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a placeholder course, enrolls the user and queues AI curriculum generation.
    The generated roadmap JSON is cached on disk by the worker and is never deleted."""
    topic = data.prompt_topic.strip()
    course = Course(
        id=str(uuid.uuid4()),
        title=f"{topic} ({uuid.uuid4().hex[:6]})",
        description="Generating curriculum...",
        difficulty=data.difficulty,
    )
    db.add(course)
    await db.flush()
    db.add(UserCourse(user_id=current_user.id, course_id=course.id))
    await db.commit()

    try:
        generate_full_curriculum.delay(course.id, topic, data.difficulty)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Generation queue unavailable") from exc

    return {"id": course.id, "title": course.title, "status": "generating"}
