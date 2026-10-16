def test_health_route_returns_backend_status(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "Skillinex Backend Online"


def test_openapi_registers_mobile_and_study_routes(client):
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/ai/sessions" in paths
    assert "/ai/message" in paths
    assert "/study/practice/execute" in paths
    assert "/study/test/generate" in paths
