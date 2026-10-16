import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.routers.study import test as test_router
from app.schemas.study import TestResultCreate as AssessmentResultCreate


class TestAssessmentFlow(unittest.IsolatedAsyncioTestCase):
    async def test_course_without_quiz_questions_is_rejected(self):
        db = AsyncMock()
        course = SimpleNamespace(id="course-1", sections=[])
        db.execute.return_value = SimpleNamespace(scalar_one_or_none=lambda: course)
        request = SimpleNamespace(node="Python", depth="Beginner", units=1)

        with patch.object(test_router, "set_session_data", AsyncMock()) as set_session:
            with self.assertRaises(HTTPException) as raised:
                await test_router.generate_test(
                    request,
                    db=db,
                    current_user=SimpleNamespace(id="user-1"),
                )

        self.assertEqual(raised.exception.status_code, 422)
        set_session.assert_not_awaited()

    async def test_unknown_course_is_rejected_before_creating_a_session(self):
        db = AsyncMock()
        db.execute.return_value = SimpleNamespace(scalar_one_or_none=lambda: None)
        with patch.object(test_router, "set_session_data", AsyncMock()) as set_session:
            with self.assertRaises(HTTPException) as raised:
                await test_router.generate_test(
                    SimpleNamespace(node="Unknown", depth="Beginner", units=1),
                    db=db,
                    current_user=SimpleNamespace(id="user-1"),
                )

        self.assertEqual(raised.exception.status_code, 404)
        set_session.assert_not_awaited()

    async def test_cannot_submit_another_users_session(self):
        db = AsyncMock()
        test_result = AssessmentResultCreate(
            node_name="Python",
            score=100,
            total_questions=1,
            analysis={},
        )
        with (
            patch.object(
                test_router,
                "get_session_data",
                AsyncMock(return_value={"user_id": "other-user", "course_id": "course-1"}),
            ),
            patch.object(test_router, "delete_session", AsyncMock()) as delete_session,
        ):
            with self.assertRaises(HTTPException) as raised:
                await test_router.submit_test_result(
                    test_result,
                    session_id="session-1",
                    db=db,
                    current_user=SimpleNamespace(id="user-1"),
                )

        self.assertEqual(raised.exception.status_code, 403)
        db.add.assert_not_called()
        delete_session.assert_not_awaited()
