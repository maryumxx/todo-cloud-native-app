from __future__ import annotations

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional
from enum import Enum


class ThemePreference(str, Enum):
    """User's theme preference options."""
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"


class User(SQLModel, table=True):
    """
    User model representing a registered user in the system.

    Fields per data-model.md:
    - id: UUID primary key
    - email: unique, indexed
    - hashed_password: bcrypt hash
    - display_name: optional display name
    - avatar_url: optional URL to avatar image
    - bio: optional user biography
    - theme_preference: light/dark/system
    - notification_preferences: JSON object
    - onboarding_completed: boolean for wizard status
    - created_at: account creation timestamp
    - updated_at: last modification timestamp
    """
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, sa_column_kwargs={"unique": True, "nullable": False, "index": True})
    hashed_password: str = Field(max_length=255, sa_column_kwargs={"nullable": False})
    display_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    bio: Optional[str] = Field(default=None, max_length=500)
    theme_preference: ThemePreference = Field(default=ThemePreference.SYSTEM)
    notification_preferences: dict = Field(default_factory=dict, sa_column=Column(JSON, default={}))
    onboarding_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})
    is_active: bool = Field(default=True)


# Pydantic schemas for API operations

class UserCreate(SQLModel):
    """Schema for user registration."""
    email: str
    password: str  # Min 8 characters


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(SQLModel):
    """Public user response (excludes sensitive data)."""
    id: UUID
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    theme_preference: str
    notification_preferences: dict
    onboarding_completed: bool
    created_at: datetime


class UserProfileUpdate(SQLModel):
    """Schema for updating user profile."""
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    theme_preference: Optional[str] = None
    notification_preferences: Optional[dict] = None
