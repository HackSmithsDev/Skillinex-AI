import uuid
import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models import User, TestResult, Course, Section, Lecture
from app.utils.redis import set_session_data, get_session_data, delete_session
from app.schemas.study import (
    TestResultCreate, 
    TestResultOut, 
    TestGenerateRequest
)

router = APIRouter()

@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_test(
    request: TestGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Fetch Course with efficient nested loading
        # Changed to title match to support the 'targetNode' string from frontend
        query = (
            select(Course)
            .where(Course.title == request.node) 
            .options(selectinload(Course.sections).selectinload(Section.lectures))
        )
        result = await db.execute(query)
        course = result.scalar_one_or_none()

        all_available_questions = []

        if course:
            for section in course.sections:
                for lecture in section.lectures:
                    if lecture.quiz_data:
                        # Ensure we're extending the list correctly
                        all_available_questions.extend(lecture.quiz_data)

        # 2. Filtering Logic
        filtered_questions = [
            q for q in all_available_questions 
            if str(q.get('difficulty', '')).lower() == request.depth.lower()
        ]

        pool = filtered_questions if filtered_questions else all_available_questions
        
        if not pool:
            final_set = [
                {
                    "question": f"Analyze the core principles of {request.node}...",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Option A",
                    "explanation": "Default system fallback."
                } for _ in range(request.units)
            ]
        else:
            # Prevent sampling more than exists
            final_set = random.sample(pool, min(len(pool), request.units))

        # 3. Redis Session Link
        session_id = f"term_{uuid.uuid4().hex[:12]}"
        session_payload = {
            "user_id": current_user.id,
            "node_name": request.node,
            "course_id": course.id if course else None,
            "questions": final_set,
            "depth": request.depth
        }
        
        await set_session_data(session_id, session_payload, expire_seconds=3600)

        return {
            "session_id": session_id,
            "node_name": request.node,
            "questions": final_set,
            "system_ref": f"DURG-TERM-{uuid.uuid4().hex[:6].upper()}"
        }

    except Exception as e:
        print(f"Terminal Logic Error: {e}")
        raise HTTPException(status_code=500, detail="Neural synthesis failed.")

@router.post("/submit", response_model=TestResultOut)
async def submit_test_result(
    test_in: TestResultCreate,
    session_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        active_session = await get_session_data(session_id)
        if not active_session:
             raise HTTPException(status_code=400, detail="Neural link expired.")

        # Create Record
        new_test = TestResult(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            node_name=test_in.node_name,
            score=test_in.score,
            total_questions=test_in.total_questions,
            analysis=test_in.analysis, # This is now a dict/JSONB
            course_id=active_session.get("course_id")
        )
        
        # XP Calculation (Safe addition)
        xp_gained = int(test_in.score * 2) 
        current_user.xp_points = (current_user.xp_points or 0) + xp_gained
        
        db.add(new_test)
        
        # Cleanup & Commit
        await delete_session(session_id)
        await db.commit()
        await db.refresh(new_test)
        
        return new_test
        
    except Exception as e:
        await db.rollback()
        print(f"Sync Error: {e}")
        raise HTTPException(status_code=400, detail="Skill sync rejected.")

@router.get("/sync/{session_id}")
async def sync_session(session_id: str, current_user: User = Depends(get_current_user)):
    """Allows the UI to recover active test data on refresh."""
    data = await get_session_data(session_id)
    if not data or data['user_id'] != current_user.id:
        raise HTTPException(status_code=404, detail="Neural session expired or unauthorized.")
    return data

@router.get("/history", response_model=List[TestResultOut])
async def get_test_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches history for the Skill Terminal sync table."""
    query = (
        select(TestResult)
        .where(TestResult.user_id == current_user.id)
        .order_by(TestResult.completed_at.desc())
        .limit(10)
    )
    result = await db.execute(query)
    return result.scalars().all()