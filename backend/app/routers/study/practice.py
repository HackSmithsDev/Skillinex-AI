import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models.user import User, UserCourse
from app.db.models.courses import Course
from app.schemas.study import DynamicExecuteRequest, UserEnvironmentOut
from app.integrations.gemini import gemini_client
from app.integrations.shared import WANDBOX_COMPILERS

router = APIRouter()

WANDBOX_URL = "https://wandbox.org/api/compile.json"

@router.get("/user-languages", response_model=List[UserEnvironmentOut])
async def get_user_dynamic_languages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Dynamically resolve runtime environments by batch-processing course 
    and tech-stack labels through the AI engine.
    """
    # 1. Fetch data
    query = select(Course).join(UserCourse).where(UserCourse.user_id == current_user.id)
    result = await db.execute(query)
    enrolled_courses = result.scalars().all()
    
    # 2. Gather all unique labels for batching
    course_list = [(c.title, "Enrolled Course") for c in enrolled_courses]
    stack_list = [(name, "Profile Tech Stack") for name in (current_user.tech_stack or {}).keys()]
    
    all_labels = course_list + stack_list
    labels_only = [item[0] for item in all_labels]
    
    # 3. ⚡ BATCH AI CALL: Perform all mapping in one request
    mapped_langs = await gemini_client.extract_batch_languages(labels_only)
    
    # 4. Construct unique environment response
    available_envs = {}
    for i, lang in enumerate(mapped_langs):
        if lang not in available_envs:
            available_envs[lang] = {
                "id": lang,
                "display_name": all_labels[i][0],
                "origin": all_labels[i][1]
            }

    # 5. System Fallback
    if not available_envs:
        return [{"id": "python", "display_name": "Python Sandbox Engine", "origin": "System Fallback"}]

    return list(available_envs.values())


@router.post("/execute")
async def execute_dynamic_code(payload: DynamicExecuteRequest):
    """
    Proxy dynamic code to the Wandbox execution engine using the best runtime
    for the selected course or language (Piston's public API now requires whitelisting).
    """
    piston_lang = payload.language or await gemini_client.extract_piston_language(payload.raw_context)
    compiler = WANDBOX_COMPILERS.get(piston_lang, WANDBOX_COMPILERS["python"])

    wandbox_payload = {
        "code": payload.code,
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
            return {
                "language": piston_lang,
                "run": {
                    "stdout": result.get("program_output", ""),
                    "stderr": result.get("program_error", "") or result.get("compiler_error", ""),
                    "code": result.get("status"),
                },
            }
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Upstream execution environment unreachable.",
            )