from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import Course, Section, Lecture, User, UserCourse, UserLectureProgress
from app.core.security import get_current_user

router = APIRouter()

# --- VAULT LOGIC ---

@router.get("/my-vault")
async def get_user_vault(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches all courses enrolled by the user via the Many-to-Many bridge.
    Calculates progress and node counts for the Vault UI cards.
    """
    result = await db.execute(
        select(Course)
        .join(UserCourse)
        .where(UserCourse.user_id == current_user.id)
        .options(
            selectinload(Course.sections).selectinload(Section.lectures)
        )
    )
    courses = result.scalars().all()
    
    vault_response = []
    for c in courses:
        # 1. Calculate total lectures (Nodes)
        total_nodes = sum(len(section.lectures) for section in c.sections)
        
        # 2. Calculate actual progress based on UserLectureProgress
        # We look for all completed lectures belonging to this course for this user
        progress_query = await db.execute(
            select(func.count(UserLectureProgress.id))
            .join(Lecture)
            .join(Section)
            .where(
                Section.course_id == c.id,
                UserLectureProgress.user_id == current_user.id,
                UserLectureProgress.is_completed == True
            )
        )
        completed_nodes = progress_query.scalar() or 0
        progress_pct = round((completed_nodes / total_nodes * 100), 1) if total_nodes > 0 else 0
        
        vault_response.append({
            "id": c.id,
            "title": c.title,
            "category": c.category or "Skillinex AI Construct",
            "description": c.description,
            "progress": progress_pct,
            "nodes": total_nodes,
            "difficulty": c.difficulty,
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
    Returns the full nested hierarchy of a course for the Sidebar navigation.
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
        raise HTTPException(status_code=404, detail="Neural Link Severed")

    # Fetch completion status for each lecture to show checkmarks in Sidebar
    progress_result = await db.execute(
        select(UserLectureProgress)
        .where(UserLectureProgress.user_id == current_user.id)
    )
    completed_ids = {p.lecture_id for p in progress_result.scalars().all() if p.is_completed}

    return {
        "id": course.id,
        "title": course.title,
        "difficulty": course.difficulty,
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
                        "time": f"{l.estimated_minutes}m",
                        "is_completed": l.id in completed_ids,
                        "overview": l.raw_text[:120] + "..." if l.raw_text else "Loading content..."
                    } for l in sorted(s.lectures, key=lambda x: x.order)
                ]
            } for s in sorted(course.sections, key=lambda x: x.order)
        ]
    }

@router.get("/lecture/{lecture_id}")
async def get_lecture_content(
    lecture_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the specific markdown and quiz data for a single node.
    """
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalars().first()

    if not lecture:
        raise HTTPException(status_code=404, detail="Node Not Found")

    # Ensure a progress record exists so we can track the 'Read' status
    progress_check = await db.execute(
        select(UserLectureProgress).where(
            UserLectureProgress.user_id == current_user.id,
            UserLectureProgress.lecture_id == lecture_id
        )
    )
    progress = progress_check.scalars().first()
    if not progress:
        progress = UserLectureProgress(user_id=current_user.id, lecture_id=lecture_id)
        db.add(progress)
        await db.commit()

    return {
        "id": lecture.id,
        "title": lecture.title,
        "raw_text": lecture.raw_text,
        "video_query": lecture.video_url, # Query for YouTube search
        "quiz_data": lecture.quiz_data,
        "is_completed": progress.is_completed
    }

@router.post("/lecture/{lecture_id}/complete")
async def complete_lecture(
    lecture_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marks a node as complete and awards XP.
    """
    result = await db.execute(
        select(UserLectureProgress).where(
            UserLectureProgress.user_id == current_user.id,
            UserLectureProgress.lecture_id == lecture_id
        )
    )
    progress = result.scalars().first()
    
    if not progress:
        progress = UserLectureProgress(user_id=current_user.id, lecture_id=lecture_id)
        db.add(progress)

    if not progress.is_completed:
        progress.is_completed = True
        current_user.xp_points += 50 # Reward for completion
        await db.commit()

    return {"status": "synced", "xp": current_user.xp_points}