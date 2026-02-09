"""
SQLModel entities for the Todo Web Application.

Exports all models for easy importing:
    from src.models import User, Task, Event
"""

from .user import (
    User,
    UserCreate,
    UserLogin,
    UserResponse,
    UserProfileUpdate,
    ThemePreference,
)
from .task import (
    Task,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskReorderRequest,
)
from .event import (
    Event,
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
)

__all__ = [
    # User models
    "User",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserProfileUpdate",
    "ThemePreference",
    # Task models
    "Task",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
    "TaskReorderRequest",
    # Event models
    "Event",
    "EventCreate",
    "EventUpdate",
    "EventResponse",
    "EventListResponse",
]
