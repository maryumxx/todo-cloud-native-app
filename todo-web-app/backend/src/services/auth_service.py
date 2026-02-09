"""
Authentication service layer.

Handles user registration, authentication, and user retrieval.
"""
from sqlmodel import Session, select
import logging
from datetime import timedelta
from typing import Tuple
from uuid import UUID

from ..models.user import User, UserCreate, UserResponse
from ..utils.password import verify_password, get_password_hash, validate_password_strength
from ..utils.jwt import create_access_token
from ..config import settings
from ..exceptions import (
    UserAlreadyExistsException,
    IncorrectPasswordException,
    UserNotFoundException,
    WeakPasswordException
)

logger = logging.getLogger(__name__)


class AuthService:
    """
    Service class for handling authentication-related operations.
    """

    def authenticate_user(self, session: Session, email: str, password: str) -> Tuple[UserResponse, str]:
        """
        Authenticate a user with email and password.

        Args:
            session: Database session
            email: User's email address
            password: User's plain password

        Returns:
            Tuple of UserResponse object and access token string

        Raises:
            UserNotFoundException: If user with given email doesn't exist
            IncorrectPasswordException: If password is incorrect
        """
        # Normalize email to lowercase for consistent lookup
        normalized_email = email.strip().lower()
        logger.debug(f"Authenticating user: {normalized_email}")

        # Find user by email (case-insensitive)
        statement = select(User).where(User.email == normalized_email)
        user = session.exec(statement).first()

        if not user:
            logger.debug(f"User not found: {normalized_email}")
            raise UserNotFoundException()

        # Verify password
        try:
            password_valid = verify_password(password, user.hashed_password)
        except ValueError as e:
            # Invalid hash format - log as error but return generic message to client
            logger.error(f"Password hash integrity error for user {normalized_email}: {e}")
            raise IncorrectPasswordException()

        if not password_valid:
            logger.debug(f"Invalid password for user: {normalized_email}")
            raise IncorrectPasswordException()

        logger.debug(f"User authenticated successfully: {normalized_email}")

        # Create access token (24 hours per research.md)
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"user_id": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )

        return self._user_to_response(user), access_token

    def register_user(
        self,
        session: Session,
        user_create: UserCreate
    ) -> Tuple[UserResponse, str]:
        """
        Register a new user.

        Args:
            session: Database session
            user_create: User creation request data

        Returns:
            Tuple of UserResponse object and access token string

        Raises:
            UserAlreadyExistsException: If user with given email already exists
            WeakPasswordException: If password doesn't meet strength requirements
        """
        # Normalize email: trim whitespace and convert to lowercase
        email = user_create.email.strip().lower()
        logger.debug(f"Attempting to register user: {email}")

        # Check if user already exists
        statement = select(User).where(User.email == email)
        existing_user = session.exec(statement).first()

        if existing_user:
            logger.debug(f"User already exists: {email}")
            raise UserAlreadyExistsException()

        # Validate password strength (min 8 chars per FR-001)
        if not validate_password_strength(user_create.password):
            logger.debug(f"Weak password for user: {email}")
            raise WeakPasswordException()

        # Create new user with hashed password
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=email,
            hashed_password=hashed_password,
            onboarding_completed=False  # New users start with onboarding
        )

        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        logger.debug(f"User created successfully: {db_user.id}")

        # Create access token (24 hours per research.md)
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"user_id": str(db_user.id), "email": db_user.email},
            expires_delta=access_token_expires
        )

        return self._user_to_response(db_user), access_token

    def get_current_user(self, session: Session, user_id: UUID) -> UserResponse:
        """
        Get the current user by ID.

        Args:
            session: Database session
            user_id: User's UUID

        Returns:
            UserResponse object

        Raises:
            UserNotFoundException: If user with given ID doesn't exist
        """
        user = session.get(User, user_id)

        if not user:
            raise UserNotFoundException()

        return self._user_to_response(user)

    def get_user_by_id(self, session: Session, user_id: UUID) -> User:
        """
        Get the raw User object by ID.

        Args:
            session: Database session
            user_id: User's UUID

        Returns:
            User model object

        Raises:
            UserNotFoundException: If user with given ID doesn't exist
        """
        user = session.get(User, user_id)

        if not user:
            raise UserNotFoundException()

        return user

    def _user_to_response(self, user: User) -> UserResponse:
        """Convert User model to UserResponse schema."""
        return UserResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            bio=user.bio,
            theme_preference=user.theme_preference.value,
            notification_preferences=user.notification_preferences,
            onboarding_completed=user.onboarding_completed,
            created_at=user.created_at
        )


# Singleton instance
auth_service = AuthService()
