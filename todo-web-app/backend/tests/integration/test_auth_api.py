import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.database import engine
from sqlmodel import Session, SQLModel, create_engine
from unittest.mock import patch


@pytest.fixture
def client():
    """Create a test client for the API."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_db_session():
    """Mock database session."""
    # Create an in-memory SQLite database for testing
    test_engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(test_engine)

    with Session(test_engine) as session:
        yield session


def test_register_endpoint(client):
    """Test the user registration endpoint."""
    # Mock the password hashing and token creation
    with patch('src.utils.password.get_password_hash', return_value='hashed_password'), \
         patch('src.utils.jwt.create_access_token', return_value='mock_access_token'):

        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )

        assert response.status_code == 200
        assert "access_token" in response.json()


def test_login_endpoint_success(client, mock_db_session):
    """Test the login endpoint with valid credentials."""
    # First register a user
    with patch('src.utils.password.get_password_hash', return_value='hashed_password'), \
         patch('src.utils.jwt.create_access_token', return_value='mock_access_token'):

        # Register user first
        register_response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )

        assert register_response.status_code == 200

        # Now try to login
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )

        assert login_response.status_code == 200
        assert "access_token" in login_response.json()


def test_logout_endpoint(client):
    """Test the logout endpoint."""
    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"