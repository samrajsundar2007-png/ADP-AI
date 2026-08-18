import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    """Instantiates a reusable HTTP test client bound to the FastAPI core."""
    with TestClient(app) as test_client:
        yield test_client
