"""
Authentication API endpoints.

Provides registration, login, token refresh, and logout functionality.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from pydantic import EmailStr, field_validator
from pydantic import BaseModel
import logging

from ..database import get_session
from ..models.response import TokenResponse, UserCreateRequest, UserLoginRequest, UserResponse
from ..services.auth_service import AuthService
from ..utils.jwt import create_access_token, create_refresh_token
from ..exceptions import (
    UserAlreadyExistsException,
    UserNotFoundException,
    IncorrectPasswordException,
    WeakPasswordException,
)
from ..api.deps import get_current_user
from ..models.user import UserResponse as UserModelResponse
from datetime import timedelta

logger = logging.getLogger(__name__)

router = APIRouter( tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User registered successfully"},
        400: {"description": "Validation error - weak password"},
        409: {"description": "Conflict - email already registered"},
        422: {"description": "Validation error"},
    }
)
def register(
    user_data: UserCreateRequest,
    session: Session = Depends(get_session)
):
    """
    Register a new user.

    - **email**: Valid email address (must be unique)
    - **password**: Password (minimum 8 characters)

    Returns access token on successful registration.
    """
    auth_service = AuthService()

    try:
        user, access_token = auth_service.register_user(session, user_data)
        logger.info(f"User registered successfully: {user_data.email}")
        return TokenResponse(access_token=access_token)

    except UserAlreadyExistsException:
        logger.warning(f"Registration failed - user already exists: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    except WeakPasswordException:
        logger.warning(f"Registration failed - weak password for: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet strength requirements (minimum 8 characters)"
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise


@router.post(
    "/login",
    response_model=dict,
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
        404: {"description": "User not found"},
        422: {"description": "Validation error"},
    }
)
def login(
    user_data: UserLoginRequest,
    session: Session = Depends(get_session)
):
    """
    Authenticate user and return access and refresh tokens.

    - **email**: Registered email address
    - **password**: User password
    """
    auth_service = AuthService()

    try:
        user, access_token = auth_service.authenticate_user(
            session,
            user_data.email,
            user_data.password
        )

        # Create refresh token
        refresh_token = create_refresh_token(
            data={"user_id": str(user.id), "email": user.email}
        )

        logger.info(f"User logged in successfully: {user_data.email}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    except UserNotFoundException:
        logger.warning(f"Login failed - user not found: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    except IncorrectPasswordException:
        logger.warning(f"Login failed - incorrect password for: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error during login: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )


@router.post("/refresh")
def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token.
    """
    from ..utils.jwt import verify_refresh_token

    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new access token
    new_access_token = create_access_token(
        data={"user_id": payload["user_id"], "email": payload["email"]},
        expires_delta=timedelta(minutes=30)
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.get(
    "/me",
    response_model=UserResponse,
    responses={
        200: {"description": "Current user info"},
        401: {"description": "Unauthorized - invalid or expired token"},
    }
)
def get_me(
    current_user: UserModelResponse = Depends(get_current_user)
):
    """
    Get the current authenticated user's information.

    Requires a valid JWT token in the Authorization header.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        created_at=current_user.created_at
    )


@router.post("/logout")
def logout():
    """
    Logout the current user (client-side token invalidation).
    """
    # In a stateless JWT system, the logout is typically handled client-side
    # by removing the token from local storage/cookies
    # In a real system, you might want to add tokens to a blacklist
    return {"message": "Logged out successfully"}