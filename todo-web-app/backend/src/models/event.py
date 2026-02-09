from __future__ import annotations

from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List


class Event(SQLModel, table=True):
    """
    Event model representing a calendar event.

    Fields per data-model.md:
    - id: UUID primary key
    - title: event title (required, max 255 chars)
    - description: optional description (max 5000 chars)
    - start_time: event start date/time (UTC)
    - end_time: event end date/time (UTC)
    - user_id: foreign key to users table
    - created_at: creation timestamp
    - updated_at: last modification timestamp
    """
    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, sa_column_kwargs={"nullable": False})
    description: Optional[str] = Field(default=None, max_length=5000)
    start_time: datetime = Field(sa_column_kwargs={"nullable": False, "index": True})
    end_time: datetime = Field(sa_column_kwargs={"nullable": False})
    user_id: UUID = Field(foreign_key="users.id", sa_column_kwargs={"nullable": False, "index": True})
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})


# Pydantic schemas for API operations

class EventCreate(SQLModel):
    """Schema for creating a new event."""
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime


class EventUpdate(SQLModel):
    """Schema for updating an event."""
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class EventResponse(SQLModel):
    """Public event response."""
    id: UUID
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    created_at: datetime
    updated_at: datetime


class EventListResponse(SQLModel):
    """Event list response."""
    items: List[EventResponse]
    total: int
