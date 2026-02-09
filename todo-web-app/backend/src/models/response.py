from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserResponse(BaseModel):
    """
    Response model for user data.
    """
    id: UUID
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """
    Response model for authentication tokens.
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Model for token payload data.
    """
    user_id: Optional[str] = None


class TaskResponse(BaseModel):
    """
    Response model for task data.
    """
    id: UUID
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskCreateRequest(BaseModel):
    """
    Request model for creating a task.
    """
    title: str
    description: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    """
    Request model for updating a task.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None


class UserCreateRequest(BaseModel):
    """
    Request model for creating a user.
    """
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase and strip whitespace."""
        return v.strip().lower()


class UserLoginRequest(BaseModel):
    """
    Request model for user login.
    """
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase and strip whitespace."""
        return v.strip().lower()