import pytest
from unittest.mock import Mock, patch
from sqlmodel import Session
from src.services.auth_service import AuthService
from src.models.user import UserCreate
from src.exceptions import UserAlreadyExistsException, UserNotFoundException, IncorrectPasswordException


def test_register_new_user():
    """Test registering a new user."""
    auth_service = AuthService()

    # Mock session
    mock_session = Mock(spec=Session)
    mock_session.exec.return_value.first.return_value = None  # No existing user

    # Mock user data
    user_create = UserCreate(email="test@example.com", password="password123")

    # Mock user object that will be returned after creation
    mock_user = Mock()
    mock_user.id = "some-uuid"
    mock_user.email = "test@example.com"

    with patch('src.services.auth_service.get_password_hash', return_value='hashed_password'), \
         patch.object(mock_session, 'add'), \
         patch.object(mock_session, 'commit'), \
         patch.object(mock_session, 'refresh') as refresh_mock:

        # Set the mock user to be returned when session.refresh is called
        refresh_mock.side_effect = lambda x: setattr(x, 'id', 'some-uuid') or setattr(x, 'email', 'test@example.com')

        user_public, access_token = auth_service.register_user(mock_session, user_create)

        # Verify the user was added to the session
        assert mock_session.add.called
        assert mock_session.commit.called
        assert mock_session.refresh.called


def test_authenticate_existing_user():
    """Test authenticating an existing user with correct credentials."""
    auth_service = AuthService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock user object
    mock_user = Mock()
    mock_user.id = "some-uuid"
    mock_user.email = "test@example.com"
    mock_user.hashed_password = "hashed_password"

    mock_session.get.return_value = mock_user

    with patch('src.services.auth_service.verify_password', return_value=True), \
         patch('src.services.auth_service.create_access_token', return_value='mock_token'):

        user_public, access_token = auth_service.authenticate_user(mock_session, "test@example.com", "password123")

        assert access_token == 'mock_token'


def test_authenticate_nonexistent_user():
    """Test authenticating a non-existent user."""
    auth_service = AuthService()

    # Mock session
    mock_session = Mock(spec=Session)
    mock_session.exec.return_value.first.return_value = None  # User doesn't exist

    with pytest.raises(UserNotFoundException):
        auth_service.authenticate_user(mock_session, "nonexistent@example.com", "password123")


def test_authenticate_wrong_password():
    """Test authenticating with wrong password."""
    auth_service = AuthService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock user object
    mock_user = Mock()
    mock_user.id = "some-uuid"
    mock_user.email = "test@example.com"
    mock_user.hashed_password = "hashed_password"

    mock_session.exec.return_value.first.return_value = mock_user

    with patch('src.services.auth_service.verify_password', return_value=False):
        with pytest.raises(IncorrectPasswordException):
            auth_service.authenticate_user(mock_session, "test@example.com", "wrong_password")