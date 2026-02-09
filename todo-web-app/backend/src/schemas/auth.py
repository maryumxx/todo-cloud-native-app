"""
Authentication-related schemas.
"""
from pydantic import BaseModel
from typing import Optional
from .user import UserResponse


class AuthResponse(BaseModel):
    """Response model for authentication (login/register)."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Model for JWT token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None
