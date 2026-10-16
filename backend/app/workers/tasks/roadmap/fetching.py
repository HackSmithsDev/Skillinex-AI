import logging
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Course, Section, Lecture, UserCourse, User

from app.workers.tasks.email import send_course_ready_email

logger = logging.getLogger(__name__)

async def save_roadmap_to_db(db: AsyncSession, course_id: str, roadmap_data: dict) -> bool:
    """
    Parses a compiled JSON roadmap layout and maps it into structural
    SQLAlchemy database records.
    """
    course_title = ""
    recipient_email = None

    try:
        # 1. Verify and update top-level Course Metadata
        course_result = await db.execute(
            select(Course).where(Course.id == course_id)
        )
        course = course_result.scalars().first()
        
        if not course:
            logger.error(f"[Ingestion Failure] Course ID {course_id} missing.")
            return False

        course.title = roadmap_data.get("title", course.title)
        course.category = roadmap_data.get("category", "General")
        course.description = roadmap_data.get("description", "")
        course.difficulty = roadmap_data.get("difficulty", "Beginner")
        await db.flush()

        course_title = course.title

        # Look up the enrolled user's email for this course
        user_result = await db.execute(
            select(User.email)
            .join(UserCourse, UserCourse.user_id == User.id)
            .where(UserCourse.course_id == course_id)
        )
        recipient_email = user_result.scalars().first()

        sections = roadmap_data.get("sections", [])
        
        # 2. Iterate through sections organically
        for s_idx, s_data in enumerate(sections):
            new_section = Section(
                course_id=course_id,
                title=s_data.get("title", f"Section {s_idx + 1}"),
                order=s_idx + 1
            )
            db.add(new_section)
            await db.flush()  # Secures new_section.id for downstream child items

            # 3. Process nested lectures safely
            lectures = s_data.get("lectures", [])
            for l_idx, l_data in enumerate(lectures):
                new_lecture = Lecture(
                    section_id=new_section.id,
                    title=l_data.get("title", f"Lecture {l_idx + 1}"),
                    raw_text=l_data.get("raw_text", ""),
                    video_url=l_data.get("video_url"),
                    quiz_data=l_data.get("quizzes", []),
                    estimated_minutes=l_data.get("estimated_minutes", 15),
                    order=l_idx + 1
                )
                db.add(new_lecture)
        
        # Commit the database transaction first
        await db.commit()
        logger.info(f"[Ingestion Success] Built database structure for course: {course_id}")

    except Exception as e:
        await db.rollback()
        logger.error(f"[Database Rollback] Ingestion failed spectacularly: {str(e)}")
        return False

    # 4. Trigger email task outside the DB transaction block
    if recipient_email:
        try:
            send_course_ready_email.delay(recipient_email, course_title)
        except Exception as mail_err:
            logger.warning(f"[Email Dispatch Warning] Could not dispatch ready email: {mail_err}")
    else:
        logger.warning(f"[Email Dispatch Warning] No user found enrolled for course ID {course_id}")

    return True