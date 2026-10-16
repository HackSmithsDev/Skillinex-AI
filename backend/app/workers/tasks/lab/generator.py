import asyncio
import json
import logging
from app.workers.celery_app import celery_app
from app.integrations.gemini import gemini_client
from app.workers.tasks.lab.schema import LabChallengeSchema
from app.utils.redis import set_active_lab_task

logger = logging.getLogger(__name__)


def build_lab_prompt(topic: str, difficulty: str) -> str:
    return f"""
You are the kernel test architect for a developer platform called Skillinex.
Create a hands-on, practical coding or scripting challenge for a developer studying: "{topic}".
Difficulty Level: {difficulty}.

CRITICAL EXECUTION REQUIREMENTS:
1. The student must write an implementation or script that satisfies the requirements.
2. The solution must run in a sandboxed CLI/compiler environment.
3. The "test_harness" MUST be executable code in the chosen language that invokes/tests the student's solution.
4. When all assertion checks pass, the test_harness MUST print exactly "1" to stdout.
5. If the test fails, it should print an informative assertion error or failure message.

Return strictly a valid JSON object matching this schema:
{{
  "task_id": "lab-{topic.lower().replace(' ', '-')[:12]}-01",
  "topic": "{topic}",
  "title": "Concise Tactical Title",
  "difficulty": "{difficulty}",
  "description": "2-3 sentences explaining the exact requirements and constraints.",
  "target_criteria": "The condition required for validation (e.g., Return 1 upon passing all boundary checks).",
  "language": "python",
  "starter_code": "# Implementation boilerplate\\ndef solve():\\n    pass\\n",
  "test_harness": "\\n# Validation Runner\\nif __name__ == '__main__':\\n    assert solve() is not None\\n    print(1)\\n"
}}
"""


@celery_app.task(bind=True, name="app.workers.tasks.lab.generator.generate_lab_challenge", max_retries=2)
def generate_lab_challenge(self, user_id: str, topic: str, difficulty: str = "Intermediate") -> dict:
    """
    Background Celery task to generate a hands-on lab challenge tailored 
    to the user's active topic and store it in Redis.
    """
    logger.info(f"[LabWorker] Generating lab challenge for user {user_id} on topic '{topic}' ({difficulty})")
    prompt = build_lab_prompt(topic, difficulty)

    try:
        if hasattr(gemini_client, "generate_json_response_sync"):
            raw_response = gemini_client.generate_json_response_sync(prompt)
        elif hasattr(gemini_client, "generate_json_response"):
            raw_response = asyncio.run(gemini_client.generate_json_response(prompt))
        else:
            raw_response = gemini_client.generate_json(prompt)

        if isinstance(raw_response, str):
            raw_response = json.loads(raw_response)

        validated_task = LabChallengeSchema(**raw_response)
        task_data = validated_task.model_dump()

        # Cache task in Redis
        asyncio.run(set_active_lab_task(user_id, task_data))
        logger.info(f"[LabWorker] Cached active lab in Redis for user {user_id}")

        return task_data

    except Exception as exc:
        logger.error(f"[LabWorker] Failed to generate challenge: {exc}", exc_info=True)
        fallback = LabChallengeSchema(
            task_id=f"lab-{topic.lower()[:8]}-fallback",
            topic=topic,
            title=f"{topic}: Logic Verification",
            difficulty=difficulty,
            description=f"Implement the foundational solution for {topic}. Ensure all internal sanity assertions hold.",
            target_criteria="Execute successfully and print 1 to stdout.",
            language="python",
            starter_code=f"# {topic} Solution Node\\ndef solution():\\n    # Implement your logic\\n    return 1\\n",
            test_harness="\nif __name__ == '__main__':\n    print(solution())\n"
        ).model_dump()

        asyncio.run(set_active_lab_task(user_id, fallback))
        return fallback