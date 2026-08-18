def test_system_handshake_node(client):
    """Asserts that the main gateway auth handshake resolves positively."""
    response = client.post("/api/auth/handshake")
    assert response.status_code == 200
    assert response.json()["authenticated"] is True

def test_models_supported_endpoint(client):
    """Ensures algorithm registry indexes return valid supported lists."""
    response = client.get("/api/models/supported")
    assert response.status_code == 200
    assert "models" in response.json()
    assert "LinearRegression" in response.json()["models"]
