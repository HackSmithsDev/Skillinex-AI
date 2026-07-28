import asyncio
import logging
from celery import shared_task
from app.integrations.groq import groq_client
from app.db.session import AsyncSessionLocal

from .schema import CourseSkeleton, LectureContentSchema
from .cache import cache_generated_roadmap
from .fetching import save_roadmap_to_db

logger = logging.getLogger(__name__)

@shared_task(name="generate_full_curriculum")
def generate_full_curriculum(course_id: str, topic: str, difficulty: str):
    """
    Isolated entry point for Celery worker. Spawns an explicit 
    event loop to handle network-heavy async API interactions safely.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(run_generator_pipeline(course_id, topic, difficulty))
    finally:
        loop.close()

async def run_generator_pipeline(course_id: str, topic: str, difficulty: str) -> bool:
    logger.info(f"[AI Sync Started] Generating {difficulty} curriculum for topic: {topic}")

    # --- STEP 1: INITIAL COMPILATION (The Skeleton) ---
    skeleton_prompt = (
        f"Design a {difficulty} level professional curriculum for '{topic}'. "
        f"Structure the course with an organic number of sections and lectures "
        f"necessary for complete mastery. Do not stick to a fixed count."
    )
    
    skeleton = await groq_client.get_structured_response(skeleton_prompt, CourseSkeleton)
    if not skeleton:
        logger.error(f"[AI Error] Groq failed to output structural skeleton for: {topic}")
        return False

    # Initialize a localized dictionary representation of our course map
    compiled_roadmap = {
        "title": skeleton.title,
        "category": skeleton.category,
        "thumbnail_url": skeleton.thumbnail_url,
        "description": skeleton.description,
        "difficulty": difficulty,
        "sections": []
    }

    # --- STEP 2: GRANULAR LECTURE POPULATION ---
    for s_data in skeleton.sections:
        current_section = {
            "title": s_data.title,
            "lectures": []
        }

        for l_title in s_data.lecture_titles:
            lecture_prompt = (
                f"Generate technical content for the lecture: '{l_title}'. "
                f"Context: Part of a {difficulty} {topic} course. "
                f"Provide a deep-dive markdown guide and 10 MCQs."
            )
            
            content = await groq_client.get_structured_response(lecture_prompt, LectureContentSchema)
            
            if content:
                current_section["lectures"].append({
                    "title": l_title,
                    "raw_text": content.raw_text,
                    "video_url": content.video_query, # Passed out cleanly as query
                    "quizzes": [q.model_dump() for q in content.quizzes],
                    "estimated_minutes": content.estimated_minutes
                })
            
            # Anti-throttling buffer delay
            await asyncio.sleep(0.4)
            
        compiled_roadmap["sections"].append(current_section)

    # --- STEP 3: PERSIST PAYLOAD TO SYSTEM CACHE ---
    # Safe on disk. Zero token waste if the database trips.
    json_path = cache_generated_roadmap(compiled_roadmap, course_id)
    logger.info(f"[Token Insurance] Raw curriculum successfully secured on disk: {json_path}")

    # --- STEP 4: PASS UNTO TARGET DATA SURGEON ---
    async with AsyncSessionLocal() as db:
        success = await save_roadmap_to_db(db, course_id, compiled_roadmap)
        return success