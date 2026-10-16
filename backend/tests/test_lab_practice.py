import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.routers.study import practice
from app.schemas.study import DynamicExecuteRequest, LabVerifyRequest


class FakeWandboxResponse:
    status_code = 200

    def __init__(self, result):
        self.result = result

    def json(self):
        return self.result


class FakeWandboxClient:
    result = {}
    request = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def post(self, _url, json, timeout):
        self.request = json
        FakeWandboxClient.request = json
        return FakeWandboxResponse(FakeWandboxClient.result)


class LabPracticeTests(unittest.IsolatedAsyncioTestCase):
    async def test_passes_only_when_the_matching_task_harness_succeeds(self):
        task = {
            "task_id": "task-1",
            "language": "python",
            "test_harness": "assert solve() == 1\nprint(1)",
        }
        FakeWandboxClient.result = {
            "status": "0",
            "program_output": "1\n",
            "program_error": "",
            "compiler_error": "",
        }
        with (
            patch.object(practice, "get_active_lab_task", AsyncMock(return_value=task)),
            patch.object(practice, "set_verified_lab_run", AsyncMock()) as set_verified,
            patch.object(practice.httpx, "AsyncClient", FakeWandboxClient),
        ):
            result = await practice.execute_dynamic_code(
                DynamicExecuteRequest(language="python", code="def solve(): return 1"),
                current_user=SimpleNamespace(id="user-1"),
            )

        self.assertTrue(result["run"]["passed"])
        self.assertIn(task["test_harness"], FakeWandboxClient.request["code"])
        set_verified.assert_awaited_once_with("user-1", "task-1")

    async def test_does_not_pass_a_task_run_in_a_different_language(self):
        FakeWandboxClient.result = {
            "status": "0",
            "program_output": "1\n",
            "program_error": "",
            "compiler_error": "",
        }
        with (
            patch.object(
                practice,
                "get_active_lab_task",
                AsyncMock(return_value={
                    "task_id": "task-1",
                    "language": "python",
                    "test_harness": "assert solve() == 1\nprint(1)",
                }),
            ),
            patch.object(practice, "set_verified_lab_run", AsyncMock()) as set_verified,
            patch.object(practice.httpx, "AsyncClient", FakeWandboxClient),
        ):
            result = await practice.execute_dynamic_code(
                DynamicExecuteRequest(language="javascript", code="console.log(1)"),
                current_user=SimpleNamespace(id="user-1"),
            )

        self.assertFalse(result["run"]["passed"])
        self.assertNotIn("test_harness", FakeWandboxClient.request["code"])
        set_verified.assert_not_awaited()

    async def test_does_not_pass_when_process_exit_status_is_nonzero(self):
        FakeWandboxClient.result = {
            "status": "1",
            "program_output": "1\n",
            "program_error": "AssertionError",
            "compiler_error": "",
        }
        with (
            patch.object(
                practice,
                "get_active_lab_task",
                AsyncMock(return_value={
                    "task_id": "task-1",
                    "language": "python",
                    "test_harness": "assert solve() == 1\nprint(1)",
                }),
            ),
            patch.object(practice, "set_verified_lab_run", AsyncMock()) as set_verified,
            patch.object(practice.httpx, "AsyncClient", FakeWandboxClient),
        ):
            result = await practice.execute_dynamic_code(
                DynamicExecuteRequest(language="python", code="def solve(): return 1"),
                current_user=SimpleNamespace(id="user-1"),
            )

        self.assertFalse(result["run"]["passed"])
        set_verified.assert_not_awaited()

    async def test_rejects_xp_claim_without_a_successful_server_run(self):
        with (
            patch.object(practice, "consume_verified_lab_run", AsyncMock(return_value=None)),
        ):
            with self.assertRaises(HTTPException) as raised:
                await practice.verify_lab(
                    LabVerifyRequest(task_id="task-1", success=True),
                    db=AsyncMock(),
                    current_user=SimpleNamespace(id="user-1", xp_points=0),
                )

        self.assertEqual(raised.exception.status_code, 409)

    async def test_awards_xp_once_for_a_verified_active_task(self):
        user = SimpleNamespace(id="user-1", xp_points=10)
        db = AsyncMock()
        with (
            patch.object(practice, "consume_verified_lab_run", AsyncMock(return_value="task-1")),
            patch.object(
                practice,
                "get_active_lab_task",
                AsyncMock(return_value={"task_id": "task-1"}),
            ),
            patch.object(practice, "claim_lab_reward", AsyncMock(return_value=True)),
        ):
            result = await practice.verify_lab(
                LabVerifyRequest(task_id="task-1", success=True),
                db=db,
                current_user=user,
            )

        self.assertEqual(result, {"xp_awarded": practice.LAB_XP, "xp_points": 35})
        db.commit.assert_awaited_once()
        db.refresh.assert_awaited_once_with(user)
