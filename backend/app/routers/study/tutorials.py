import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.db.session import get_db
from app.db.models import Course, Section, Lecture, User, UserCourse, PracticeRecord
from app.core.security import get_current_user

router = APIRouter()


class LectureCompletionPayload(BaseModel):
    time_spent_seconds: Optional[int] = 0


# --- VAULT LOGIC ---

@router.get("/my-vault")
async def get_user_vault(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches all courses enrolled by the user.
    Uses PracticeRecord.course_id directly for an instant, indexed progress query.
    """
    # 1. Fetch user's enrolled courses with sections & lectures loaded
    result = await db.execute(
        select(Course)
        .join(UserCourse, UserCourse.course_id == Course.id)
        .where(UserCourse.user_id == current_user.id)
        .options(
            selectinload(Course.sections).selectinload(Section.lectures)
        )
    )
    courses = result.scalars().all()

    if not courses:
        return []

    course_ids = [c.id for c in courses]

    # 2. Fast direct aggregate: count completed records per course using PracticeRecord.course_id
    progress_query = await db.execute(
        select(PracticeRecord.course_id, func.count(PracticeRecord.id))
        .where(
            PracticeRecord.course_id.in_(course_ids),
            PracticeRecord.user_id == current_user.id,
            PracticeRecord.status == "completed"
        )
        .group_by(PracticeRecord.course_id)
    )
    completed_counts = dict(progress_query.all())

    # 3. Assemble response payload
    vault_response = []
    for c in courses:
        total_nodes = sum(len(section.lectures) for section in c.sections)
        completed_nodes = completed_counts.get(c.id, 0)
        progress_pct = round((completed_nodes / total_nodes * 100), 1) if total_nodes > 0 else 0.0

        vault_response.append({
            "id": c.id,
            "title": c.title,
            "category": c.category or "Skillinex AI Construct",
            "description": c.description,
            "progress": progress_pct,
            "nodes": total_nodes,
            "difficulty": getattr(c, "difficulty", "Intermediate"),
            "is_ready": total_nodes > 0,
            "gradient": "from-indigo-500/10 to-blue-500/10"
        })

    return vault_response


# --- TUTORIAL/COURSE CONTENT LOGIC ---

@router.get("/courses/{course_id}")
async def get_course_details(
    course_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the nested course tree and marks completed lectures for the sidebar.
    """
    result = await db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(
            selectinload(Course.sections).selectinload(Section.lectures)
        )
    )
    course = result.scalars().first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Neural Link Severed: Course not found"
        )

    # Scoped directly by course_id using PracticeRecord
    progress_result = await db.execute(
        select(PracticeRecord.lecture_id)
        .where(
            PracticeRecord.course_id == course_id,
            PracticeRecord.user_id == current_user.id,
            PracticeRecord.status == "completed"
        )
    )
    completed_ids = set(progress_result.scalars().all())

    return {
        "id": course.id,
        "title": course.title,
        "difficulty": getattr(course, "difficulty", "Standard"),
        "sections": [
            {
                "id": s.id,
                "name": s.title,
                "order": s.order,
                "chapters": [
                    {
                        "id": l.id,
                        "title": l.title,
                        "order": l.order,
                        "time": f"{l.estimated_minutes or 10}m",
                        "is_completed": l.id in completed_ids,
                        "overview": (l.raw_text[:120] + "...") if l.raw_text else "Loading content..."
                    }
                    for l in sorted(s.lectures, key=lambda x: x.order)
                ]
            }
            for s in sorted(course.sections, key=lambda x: x.order)
        ]
    }


@router.get("/lecture/{lecture_id}")
async def get_lecture_content(
    lecture_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the specific markdown and quiz data for a node and retrieves the practice status.
    """
    result = await db.execute(
        select(Lecture)
        .options(selectinload(Lecture.section))
        .where(Lecture.id == lecture_id)
    )
    lecture = result.scalars().first()

    if not lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Node Not Found"
        )

    # Check existing practice record
    record_result = await db.execute(
        select(PracticeRecord).where(
            PracticeRecord.user_id == current_user.id,
            PracticeRecord.lecture_id == lecture_id
        )
    )
    record = record_result.scalars().first()

    return {
        "id": lecture.id,
        "course_id": lecture.section.course_id if lecture.section else None,
        "title": lecture.title,
        "raw_text": lecture.raw_text,
        "video_query": lecture.video_url,
        "quiz_data": lecture.quiz_data,
        "is_completed": record.status == "completed" if record else False,
        "time_spent_seconds": record.time_spent_seconds if record else 0
    }


@router.post("/lecture/{lecture_id}/complete")
async def complete_lecture(
    lecture_id: str,
    payload: Optional[LectureCompletionPayload] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Records lecture completion in PracticeRecord and awards XP.
    """
    # 1. Fetch lecture and its parent section/course_id
    lecture_result = await db.execute(
        select(Lecture)
        .options(selectinload(Lecture.section))
        .where(Lecture.id == lecture_id)
    )
    lecture = lecture_result.scalars().first()

    if not lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Lecture node not found"
        )

    course_id = lecture.section.course_id if lecture.section else None
    time_spent = payload.time_spent_seconds if payload else 0
    xp_to_award = 50

    # 2. Check for existing PracticeRecord
    record_result = await db.execute(
        select(PracticeRecord).where(
            PracticeRecord.user_id == current_user.id,
            PracticeRecord.lecture_id == lecture_id
        )
    )
    record = record_result.scalars().first()

    if not record:
        # Create completed record
        record = PracticeRecord(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            lecture_id=lecture_id,
            course_id=course_id,
            xp_earned=xp_to_award,
            status="completed",
            time_spent_seconds=time_spent
        )
        db.add(record)

        # Award user XP safely in the transaction
        user = await db.get(User, current_user.id)
        if user:
            user.xp_points = (user.xp_points or 0) + xp_to_award
            await db.commit()
            return {"status": "synced", "xp": user.xp_points, "xp_earned": xp_to_award}

    elif record.status != "completed":
        # Transition existing incomplete session to completed
        record.status = "completed"
        record.xp_earned = xp_to_award
        record.time_spent_seconds += time_spent

        user = await db.get(User, current_user.id)
        if user:
            user.xp_points = (user.xp_points or 0) + xp_to_award
            await db.commit()
            return {"status": "synced", "xp": user.xp_points, "xp_earned": xp_to_award}
    else:
        # Already completed: update duration without double-awarding XP
        record.time_spent_seconds += time_spent

    await db.commit()
    user = await db.get(User, current_user.id)
    return {"status": "already_completed", "xp": user.xp_points if user else 0, "xp_earned": 0}