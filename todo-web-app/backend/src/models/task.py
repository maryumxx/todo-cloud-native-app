from __future__ import annotations

from sqlmodel import SQLModel, Field
from datetime import datetime, date
from uuid import UUID, uuid4
from typing import Optional, List


class Task(SQLModel, table=True):
    """
    Task model representing a user's todo item.

    Fields per data-model.md:
    - id: UUID primary key
    - title: task title (required, max 255 chars)
    - description: optional description (max 5000 chars)
    - is_completed: completion status
    - due_date: optional due date (date only)
    - position: order position for drag-drop sorting
    - user_id: foreign key to users table
    - created_at: creation timestamp
    - updated_at: last modification timestamp
    """
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, sa_column_kwargs={"nullable": False})
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False)
    due_date: Optional[date] = Field(default=None, sa_column_kwargs={"index": True})
    position: int = Field(default=0)
    user_id: UUID = Field(foreign_key="users.id", sa_column_kwargs={"nullable": False, "index": True})
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})


# Pydantic schemas for API operations

class TaskCreate(SQLModel):
    """Schema for creating a new task."""
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None


class TaskUpdate(SQLModel):
    """Schema for updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[date] = None


class TaskResponse(SQLModel):
    """Public task response."""
    id: UUID
    title: str
    description: Optional[str]
    is_completed: bool
    due_date: Optional[date]
    position: int
    created_at: datetime
    updated_at: datetime


class TaskListResponse(SQLModel):
    """Paginated task list response."""
    items: List[TaskResponse]
    total: int
    page: int
    limit: int
    has_more: bool


class TaskReorderRequest(SQLModel):
    """Schema for reordering tasks (drag-and-drop)."""
    task_ids: List[UUID]  # Ordered list of task IDs
