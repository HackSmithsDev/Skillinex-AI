from datetime import timedelta

from app.core.security import create_access_token


def test_protected_route_rejects_missing_token(client):
    response = client.get("/ai/sessions")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication token missing"


def test_protected_route_rejects_invalid_token(client):
    response = client.get(
        "/ai/sessions",
        headers={"Authorization": "Bearer not-a-valid-token"},
    )

    assert response.status_code == 401


def test_protected_route_rejects_expired_token(client, test_user):
    expired_token = create_access_token(
        test_user.id,
        expires_delta=timedelta(seconds=-1),
    )

    response = client.get(
        "/ai/sessions",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Session has expired. Please log in again."


def test_inactive_user_cannot_access_protected_route(
    authenticated_client,
    database_session,
    test_user,
):
    test_user.is_active = False

    response = authenticated_client.get("/ai/sessions")

    assert response.status_code == 400
    assert response.json()["detail"] == "User account is inactive"
    database_session.execute.assert_awaited_once()
