import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import logging

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models.user import User, UserCourse
from app.db.models.courses import Course
from app.schemas.study import DynamicExecuteRequest, UserEnvironmentOut, LabVerifyRequest
from app.integrations.gemini import gemini_client
from app.integrations.shared import WANDBOX_COMPILERS
from app.utils.redis import (
    claim_lab_reward,
    consume_verified_lab_run,
    get_active_lab_task,
    release_lab_reward_claim,
    set_active_lab_task,
    set_verified_lab_run,
)
from app.workers.tasks.lab.generator import generate_lab_challenge

router = APIRouter()
logger = logging.getLogger(__name__)

WANDBOX_URL = "https://wandbox.org/api/compile.json"
LAB_XP = 25


async def resolve_user_topic(db: AsyncSession, user: User) -> str:
    """Finds the primary focus topic from active courses or tech stack."""
    query = select(Course).join(UserCourse).where(UserCourse.user_id == user.id)
    result = await db.execute(query)
    enrolled = result.scalars().first()
    if enrolled and enrolled.title:
        return enrolled.title

    if user.tech_stack and len(user.tech_stack) > 0:
        return list(user.tech_stack.keys())[0]

    return "Python Programming"


@router.get("/active-task")
async def get_active_lab_challenge(
    topic: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the cached active lab task for this user.
    If none exists in Redis, triggers Celery generation and returns an immediate bootstrap task.
    """
    user_id_str = str(current_user.id)
    cached_task = await get_active_lab_task(user_id_str)
    
    # If client specifically requested a different topic than cached, trigger reload
    if cached_task and (not topic or cached_task.get("topic", "").lower() == topic.lower()):
        return cached_task

    target_topic = topic or await resolve_user_topic(db, current_user)

    if cached_task:
        try:
            generate_lab_challenge.delay(user_id_str, target_topic, "Intermediate")
        except Exception as exc:
            logger.exception("Failed to queue a lab challenge for user %s", user_id_str)
            raise HTTPException(status_code=503, detail="Lab challenge generation is temporarily unavailable.") from exc
        return cached_task

    # Return a runnable bootstrap while the background task creates the real challenge.
    clean_topic_slug = target_topic.lower().replace(" ", "-")[:12]
    bootstrap_task = {
        "task_id": f"lab-{clean_topic_slug}-01",
        "topic": target_topic,
        "title": f"{target_topic} Operational Logic",
        "difficulty": "Intermediate",
        "description": f"Implement the core validation logic for {target_topic}. Your solution must return 1 on valid states.",
        "target_criteria": "Return 1 when validation assertions pass.",
        "language": "python",
        "starter_code": f"# {target_topic} Validation Challenge\ndef solve():\n    # Implement logic here\n    return 1\n",
        "test_harness": "\nif __name__ == '__main__':\n    assert solve() == 1\n    print(1)\n",
        "is_bootstrap": True,
    }
    await set_active_lab_task(user_id_str, bootstrap_task)

    try:
        generate_lab_challenge.delay(user_id_str, target_topic, "Intermediate")
    except Exception:
        fallback_task = {**bootstrap_task, "is_bootstrap": False, "generation_error": True}
        await set_active_lab_task(user_id_str, fallback_task)
        logger.exception("Failed to queue a lab challenge for user %s", user_id_str)
        return fallback_task

    return bootstrap_task


@router.get("/user-languages", response_model=List[UserEnvironmentOut])
async def get_user_dynamic_languages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Dynamically resolve runtime environments by batch-processing course 
    and tech-stack labels through the AI engine.
    """
    query = select(Course).join(UserCourse).where(UserCourse.user_id == current_user.id)
    result = await db.execute(query)
    enrolled_courses = result.scalars().all()

    course_list = [(c.title, "Enrolled Course") for c in enrolled_courses]
    stack_list = [(name, "Profile Tech Stack") for name in (current_user.tech_stack or {}).keys()]

    all_labels = course_list + stack_list
    labels_only = [item[0] for item in all_labels]

    if not labels_only:
        return [{"id": "python", "display_name": "Python Sandbox Engine", "origin": "System Fallback"}]

    mapped_langs = await gemini_client.extract_batch_languages(labels_only)

    available_envs = {}
    for (label, origin), lang in zip(all_labels, mapped_langs):
        if lang not in WANDBOX_COMPILERS:
            continue
        if lang not in available_envs:
            available_envs[lang] = {
                "id": lang,
                "display_name": label,
                "origin": origin,
            }

    if not available_envs:
        return [{"id": "python", "display_name": "Python Sandbox Engine", "origin": "System Fallback"}]

    return list(available_envs.values())


@router.post("/execute")
async def execute_dynamic_code(
    payload: DynamicExecuteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Compiles code via Wandbox. If an active task test_harness exists in Redis,
    it seamlessly appends assertions so the solution is thoroughly checked.
    """
    user_id_str = str(current_user.id)
    active_task = await get_active_lab_task(user_id_str)

    piston_lang = (payload.language or "python").strip().lower()
    compiler = WANDBOX_COMPILERS.get(piston_lang)
    if not compiler:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported runtime '{piston_lang}'. Choose one of: {', '.join(sorted(WANDBOX_COMPILERS))}.",
        )

    code_to_run = payload.code
    task_id = None
    has_task_harness = bool(
        active_task
        and active_task.get("test_harness")
        and active_task.get("language", "python").strip().lower() == piston_lang
    )

    # Always append the server-owned harness so user code cannot replace it.
    if has_task_harness:
        harness = active_task["test_harness"].strip()
        if harness:
            code_to_run = f"{code_to_run}\n\n{harness}"
            task_id = active_task.get("task_id")

    wandbox_payload = {
        "code": code_to_run,
        "compiler": compiler,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(WANDBOX_URL, json=wandbox_payload, timeout=15.0)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Ecosystem compiler cluster rejected runtime payload.",
                )
            result = response.json()
            stdout = result.get("program_output", "")
            stderr = result.get("program_error", "") or result.get("compiler_error", "")
            exit_status = result.get("status")
            is_passed = bool(
                task_id
                and exit_status in (0, "0")
                and stdout.strip() == "1"
                and not stderr
            )
            if is_passed:
                await set_verified_lab_run(user_id_str, task_id)

            return {
                "language": piston_lang,
                "run": {
                    "stdout": stdout,
                    "stderr": stderr,
                    "code": exit_status,
                    "passed": is_passed,
                },
            }
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Upstream execution environment unreachable.",
            )


@router.post("/verify-lab")
async def verify_lab(
    data: LabVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Awards XP for a successfully completed lab task."""
    if not data.success:
        return {"xp_awarded": 0, "xp_points": current_user.xp_points or 0}

    verified_task_id = await consume_verified_lab_run(str(current_user.id))
    if verified_task_id != data.task_id:
        raise HTTPException(status_code=409, detail="Run this lab successfully before claiming its XP.")

    active_task = await get_active_lab_task(str(current_user.id))
    if not active_task or active_task.get("task_id") != verified_task_id:
        raise HTTPException(status_code=409, detail="This lab challenge is no longer active.")

    claimed = await claim_lab_reward(str(current_user.id), verified_task_id)
    if not claimed:
        return {"xp_awarded": 0, "xp_points": current_user.xp_points or 0}

    try:
        current_user.xp_points = (current_user.xp_points or 0) + LAB_XP
        await db.commit()
        await db.refresh(current_user)
    except Exception:
        await release_lab_reward_claim(str(current_user.id), verified_task_id)
        await db.rollback()
        raise

    return {"xp_awarded": LAB_XP, "xp_points": current_user.xp_points}