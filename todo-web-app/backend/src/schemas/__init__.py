"""
Pydantic schemas for API request/response validation.
"""

from .auth import AuthResponse, TokenData
from .user import UserCreate, UserLogin, UserResponse, UserProfileUpdate
from .task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskReorderRequest,
)
from .event import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
)
from .response import ErrorResponse, SuccessResponse

__all__ = [
    # Auth schemas
    "AuthResponse",
    "TokenData",
    # User schemas
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserProfileUpdate",
    # Task schemas
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
    "TaskReorderRequest",
    # Event schemas
    "EventCreate",
    "EventUpdate",
    "EventResponse",
    "EventListResponse",
    # Common schemas
    "ErrorResponse",
    "SuccessResponse",
]
