from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models.courses import Course, Section, Lecture
from app.db.models.user import User  # Your User database model file
# 🚀 IMPORT THE TEST RESULT MODEL SO SQLALCHEMY SEES THE SCORE COLUMN
from app.db.models import TestResult 

from app.schemas import DashboardOut, CourseOut

router = APIRouter()

@router.get("/dashboard", response_model=DashboardOut)
async def get_user_stats(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch User with Enrolled Courses and Lecture Progress
    result = await db.execute(
        select(User)
        .where(User.id == current_user.id)
        .options(
            selectinload(User.enrolled_courses)
            .selectinload(Course.sections)
            .selectinload(Section.lectures),
            selectinload(User.lecture_progress)
        )
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User tracking signature not found")

    # 2. ✨ FIX: Query the core TestResult table for the dynamic average score
    score_query = await db.execute(
        select(func.avg(TestResult.score))
        .where(TestResult.user_id == current_user.id)
    )
    db_avg_score = score_query.scalar()
    
    # Cast to integer safely. If no tests have been completed yet, fall back to 0.
    avg_score_pct = int(db_avg_score) if db_avg_score is not None else 0

    # 3. Determine the "Active" Course
    current_course_data = None
    if user.enrolled_courses:
        # Grabbing the primary active course from the enrollment list
        course = user.enrolled_courses[0] 
        
        # Calculate Progress from UserLectureProgress
        all_lectures = [l.id for s in course.sections for l in s.lectures]
        completed = [p for p in user.lecture_progress if p.lecture_id in all_lectures and p.is_completed]
        
        total_count = len(all_lectures)
        completed_count = len(completed)
        progress_pct = int((completed_count / total_count) * 100) if total_count > 0 else 0

        current_course_data = {
            "id": course.id,
            "title": course.title,
            "difficulty": getattr(course, 'difficulty', 'Intermediate'),
            "thumbnail_url": getattr(course, 'thumbnail_url', None),
            "progress": progress_pct,
            "completedLectures": completed_count,
            "totalLectures": total_count,
            "timeLeft": f"{total_count * 15}m" 
        }

    return {
        "stats": {
            "name": user.full_name or user.email.split('@')[0],
            "totalXP": user.xp_points or 0,
            "topCategory": "AI & ML", 
            "avgScore": avg_score_pct,  # Now passing a safe, dynamically computed score
            "dailyGoalStatus": "Keep pushing forward with your programming objectives!",
            "goals": [
                {"label": "Complete 1 Quiz", "done": False},
                {"label": "Watch 2 Videos", "done": False}
            ]
        },
        "currentCourse": current_course_data
    }

@router.get("/trending", response_model=List[CourseOut])
async def get_trending_courses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.sections).selectinload(Section.lectures))
        .limit(6)
    )
    return result.scalars().all()

@router.get("/search")
async def search_library(q: str = Query(..., min_length=3), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Course).where(Course.title.ilike(f"%{q}%"))
    )
    return result.scalars().all()