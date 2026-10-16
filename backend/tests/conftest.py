from collections.abc import AsyncIterator, Iterator
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app import create_app
from app.core.security import create_access_token
from app.db.models.user import User
from app.db.session import get_db


@pytest.fixture
def test_user() -> User:
    return User(
        id=str(uuid4()),
        email="engineer@example.test",
        hashed_password="not-a-real-password-hash",
        full_name="Test Engineer",
        is_active=True,
        xp_points=0,
        tech_stack={"Python": "Intermediate"},
    )


@pytest.fixture
def database_session(test_user: User) -> MagicMock:
    scalar_result = MagicMock()
    scalar_result.first.return_value = test_user
    scalar_result.all.return_value = []
    scalar_result.one.return_value = test_user

    query_result = MagicMock()
    query_result.scalars.return_value = scalar_result
    query_result.scalar_one_or_none.return_value = None

    session = MagicMock()
    session.execute = AsyncMock(return_value=query_result)
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    session.add_all = MagicMock()
    return session


@pytest.fixture
def app(database_session: MagicMock) -> Iterator[FastAPI]:
    test_app = create_app()

    async def override_get_db() -> AsyncIterator[MagicMock]:
        yield database_session

    test_app.dependency_overrides[get_db] = override_get_db
    yield test_app
    test_app.dependency_overrides.clear()


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def authenticated_client(client: TestClient, test_user: User) -> TestClient:
    token = create_access_token(test_user.id)
    client.headers["Authorization"] = f"Bearer {token}"
    return client
