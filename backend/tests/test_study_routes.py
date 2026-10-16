from unittest.mock import AsyncMock

from app.routers.study import practice, test as test_router


def test_lab_rejects_unsupported_language_without_running_code(
    authenticated_client,
    monkeypatch,
):
    get_active_task = AsyncMock(return_value=None)
    monkeypatch.setattr(practice, "get_active_lab_task", get_active_task)

    response = authenticated_client.post(
        "/study/practice/execute",
        json={"language": "unsupported-runtime", "code": "print('hello')"},
    )

    assert response.status_code == 400
    assert "Unsupported runtime" in response.json()["detail"]
    get_active_task.assert_awaited_once()


def test_test_submission_rejects_another_users_session(
    authenticated_client,
    database_session,
    monkeypatch,
):
    get_session = AsyncMock(
        return_value={"user_id": "someone-else", "course_id": "course-1"}
    )
    delete_session = AsyncMock()
    monkeypatch.setattr(test_router, "get_session_data", get_session)
    monkeypatch.setattr(test_router, "delete_session", delete_session)

    response = authenticated_client.post(
        "/study/test/submit?session_id=session-1",
        json={
            "node_name": "Python",
            "score": 80,
            "total_questions": 10,
            "analysis": {},
        },
    )

    assert response.status_code == 403
    assert "another user" in response.json()["detail"]
    database_session.add.assert_not_called()
    database_session.rollback.assert_awaited_once()
    delete_session.assert_not_awaited()
