"""Pytest fixtures — isolated in-memory SQLite DB per test session."""
import os
import sys
from pathlib import Path

# Ensure the `app` package is importable and use a throwaway SQLite DB.
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
os.environ["DATABASE_URL"] = "sqlite:///./test_aisc.db"
os.environ["SECRET_KEY"] = "test-secret"
os.environ["OPENAI_API_KEY"] = ""  # force offline stubs

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.db.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


TEST_ENGINE = create_engine(
    "sqlite:///./test_aisc.db", connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autocommit=False, autoflush=False)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.drop_all(bind=TEST_ENGINE)
    Base.metadata.create_all(bind=TEST_ENGINE)
    app.dependency_overrides[get_db] = _override_get_db
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)
    try:
        os.remove("./test_aisc.db")
    except OSError:
        pass


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_client(client):
    """A TestClient with a registered user and auth header set."""
    payload = {
        "email": "tester@example.com",
        "username": "tester",
        "password": "s3cret123",
    }
    r = client.post("/auth/register", json=payload)
    if r.status_code == 400:  # already exists from a previous test
        r = client.post(
            "/auth/login",
            data={"username": payload["email"], "password": payload["password"]},
        )
    token = r.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
