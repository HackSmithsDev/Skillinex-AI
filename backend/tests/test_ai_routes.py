from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.db.models.interaction import ChatSession
from app.routers.ai import routes as ai_routes


def test_authenticated_user_can_list_their_sessions(
    authenticated_client,
    database_session,
):
    response = authenticated_client.get("/ai/sessions")

    assert response.status_code == 200
    assert response.json() == []
    assert database_session.execute.await_count == 2


def test_user_can_create_an_ai_session(
    authenticated_client,
    database_session,
    test_user,
):
    created_session = ChatSession(
        id=str(uuid4()),
        user_id=test_user.id,
        title="Python mentoring",
        context_metadata={"tech_stack": test_user.tech_stack},
        created_at=datetime.now(timezone.utc),
        messages=[],
    )
    session_result = MagicMock()
    session_result.scalars.return_value.one.return_value = created_session
    database_session.execute.side_effect = [
        database_session.execute.return_value,
        session_result,
    ]

    response = authenticated_client.post(
        "/ai/sessions",
        json={"title": "Python mentoring"},
    )

    assert response.status_code == 200
    assert response.json()["id"] == created_session.id
    assert response.json()["title"] == "Python mentoring"
    added_session = database_session.add.call_args.args[0]
    assert added_session.user_id == test_user.id
    assert added_session.context_metadata == {"tech_stack": test_user.tech_stack}
    database_session.commit.assert_awaited_once()


def test_mobile_ai_message_request_returns_assistant_response(
    authenticated_client,
    database_session,
    monkeypatch,
    test_user,
):
    session_id = str(uuid4())
    chat_session = ChatSession(
        id=session_id,
        user_id=test_user.id,
        title="Python mentoring",
        context_metadata={},
        created_at=datetime.now(timezone.utc),
        messages=[],
    )
    session_result = MagicMock()
    session_result.scalars.return_value.first.return_value = chat_session
    database_session.execute.side_effect = [
        database_session.execute.return_value,
        session_result,
    ]
    generate_response = AsyncMock(return_value="Try using a list comprehension.")
    create_title = MagicMock()
    monkeypatch.setattr(ai_routes, "generate_mentor_response", generate_response)
    monkeypatch.setattr(ai_routes.generate_session_title_task, "delay", create_title)

    async def refresh_message(message):
        message.id = str(uuid4())
        message.created_at = datetime.now(timezone.utc)

    database_session.refresh.side_effect = refresh_message

    response = authenticated_client.post(
        "/ai/message",
        json={"session_id": session_id, "content": "How do list comprehensions work?"},
    )

    assert response.status_code == 200
    assert response.json()["role"] == "assistant"
    assert response.json()["content"] == "Try using a list comprehension."
    generate_response.assert_awaited_once()
    assert generate_response.await_args.kwargs["current_message"] == (
        "How do list comprehensions work?"
    )
    create_title.assert_called_once_with(
        session_id,
        "How do list comprehensions work?",
    )
    database_session.add_all.assert_called_once()
    database_session.commit.assert_awaited_once()
