# Data Model: Todo Web Application

**Feature**: 002-todo-web-app | **Date**: 2026-01-21 (Updated for Phase 2 Auth Rebuild)

## Overview

This document defines the database schema for the Todo Web Application. All models use SQLModel with Neon Serverless PostgreSQL.

---

## Phase 2 Authentication - Simplified User Model

For the Phase 2 authentication rebuild, a simplified User model is used with integer primary key as specified:

### Simplified User Entity (Phase 2 Auth)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, AUTO_INCREMENT | Unique identifier |
| `email` | String(255) | UNIQUE, NOT NULL, INDEX | User's email (lowercase) |
| `hashed_password` | String(255) | NOT NULL | bcrypt hashed password |
| `created_at` | DateTime | DEFAULT=now(), NOT NULL | Account creation timestamp |

### SQLAlchemy Definition (Phase 2)

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
```

### Pydantic Schemas (Phase 2 Auth)

```python
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str  # Min 8 characters

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │      Task       │       │      Event      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK, UUID)   │──┐    │ id (PK, UUID)   │       │ id (PK, UUID)   │
│ email (unique)  │  │    │ title           │       │ title           │
│ hashed_password │  │    │ description     │       │ description     │
│ display_name    │  │    │ is_completed    │       │ start_time      │
│ avatar_url      │  │    │ due_date        │       │ end_time        │
│ bio             │  │    │ position        │       │ user_id (FK)────┼──┐
│ theme_preference│  └───►│ user_id (FK)    │       │ created_at      │  │
│ notifications   │       │ created_at      │       │ updated_at      │  │
│ onboarding_done │       │ updated_at      │       └─────────────────┘  │
│ created_at      │       └─────────────────┘                            │
│ updated_at      │                                                      │
└─────────────────┘◄─────────────────────────────────────────────────────┘
```

**Relationships**:
- User → Task: One-to-Many (user_id FK with CASCADE delete)
- User → Event: One-to-Many (user_id FK with CASCADE delete)

---

## Entity: User

Represents a registered user account.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default=uuid4 | Unique identifier |
| `email` | String(255) | UNIQUE, NOT NULL, INDEX | User's email address |
| `hashed_password` | String(255) | NOT NULL | bcrypt hashed password |
| `display_name` | String(100) | NULL | Optional display name |
| `avatar_url` | String(500) | NULL | URL to avatar image |
| `bio` | Text | NULL | User biography (max 500 chars) |
| `theme_preference` | Enum | DEFAULT='system' | 'light', 'dark', 'system' |
| `notification_preferences` | JSON | DEFAULT='{}' | Notification settings object |
| `onboarding_completed` | Boolean | DEFAULT=false | Has completed onboarding wizard |
| `created_at` | DateTime | DEFAULT=now(), NOT NULL | Account creation timestamp |
| `updated_at` | DateTime | DEFAULT=now(), ON UPDATE | Last modification timestamp |

### Indexes

- `ix_user_email` - UNIQUE index on `email`
- `ix_user_created_at` - Index on `created_at` for sorting

### Validation Rules

- `email`: Valid email format, case-insensitive unique
- `hashed_password`: Minimum 60 chars (bcrypt hash length)
- `display_name`: Max 100 characters
- `bio`: Max 500 characters
- `theme_preference`: Must be one of 'light', 'dark', 'system'

### SQLModel Definition

```python
from __future__ import annotations
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class ThemePreference(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    display_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    bio: Optional[str] = Field(default=None, max_length=500)
    theme_preference: ThemePreference = Field(default=ThemePreference.SYSTEM)
    notification_preferences: dict = Field(default_factory=dict, sa_column_kwargs={"server_default": "{}"})
    onboarding_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Entity: Task

Represents a user's todo item.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default=uuid4 | Unique identifier |
| `title` | String(255) | NOT NULL | Task title |
| `description` | Text | NULL | Optional task description |
| `is_completed` | Boolean | DEFAULT=false, NOT NULL | Completion status |
| `due_date` | Date | NULL | Optional due date (date only) |
| `position` | Integer | NOT NULL, DEFAULT=0 | Order position for drag-drop |
| `user_id` | UUID | FK(users.id), NOT NULL, INDEX | Owner reference |
| `created_at` | DateTime | DEFAULT=now(), NOT NULL | Creation timestamp |
| `updated_at` | DateTime | DEFAULT=now(), ON UPDATE | Last modification timestamp |

### Indexes

- `ix_task_user_id` - Index on `user_id` for filtering
- `ix_task_user_position` - Composite index on (`user_id`, `position`) for sorted retrieval
- `ix_task_due_date` - Index on `due_date` for calendar queries

### Foreign Keys

- `user_id` → `users.id` with `ON DELETE CASCADE`

### Validation Rules

- `title`: Required, max 255 characters, non-empty
- `description`: Max 5000 characters
- `position`: Non-negative integer
- `due_date`: Valid date or null

### SQLModel Definition

```python
from __future__ import annotations
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID, uuid4

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False)
    due_date: Optional[date] = Field(default=None, index=True)
    position: int = Field(default=0)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Entity: Event

Represents a calendar event.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default=uuid4 | Unique identifier |
| `title` | String(255) | NOT NULL | Event title |
| `description` | Text | NULL | Optional event description |
| `start_time` | DateTime | NOT NULL | Event start date/time (UTC) |
| `end_time` | DateTime | NOT NULL | Event end date/time (UTC) |
| `user_id` | UUID | FK(users.id), NOT NULL, INDEX | Owner reference |
| `created_at` | DateTime | DEFAULT=now(), NOT NULL | Creation timestamp |
| `updated_at` | DateTime | DEFAULT=now(), ON UPDATE | Last modification timestamp |

### Indexes

- `ix_event_user_id` - Index on `user_id` for filtering
- `ix_event_start_time` - Index on `start_time` for calendar queries
- `ix_event_user_date_range` - Composite index on (`user_id`, `start_time`, `end_time`)

### Foreign Keys

- `user_id` → `users.id` with `ON DELETE CASCADE`

### Validation Rules

- `title`: Required, max 255 characters, non-empty
- `description`: Max 5000 characters
- `start_time`: Required, must be valid UTC datetime
- `end_time`: Required, must be >= start_time

### SQLModel Definition

```python
from __future__ import annotations
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4

class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=5000)
    start_time: datetime = Field()
    end_time: datetime = Field()
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Pydantic Schemas (API Transfer Objects)

### User Schemas

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Min 8 characters

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    theme_preference: str
    notification_preferences: dict
    onboarding_completed: bool
    created_at: datetime

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    theme_preference: Optional[str] = None
    notification_preferences: Optional[dict] = None
```

### Task Schemas

```python
from datetime import date

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[date] = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    is_completed: bool
    due_date: Optional[date]
    position: int
    created_at: datetime
    updated_at: datetime

class TaskReorderRequest(BaseModel):
    task_ids: list[UUID]  # Ordered list of task IDs
```

### Event Schemas

```python
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class EventResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    created_at: datetime
    updated_at: datetime
```

---

## Database Migration Strategy

### Initial Migration

1. Create `users` table with all columns and indexes
2. Create `tasks` table with foreign key to users
3. Create `events` table with foreign key to users

### Migration Tool

Use Alembic with SQLModel:
- Auto-generate migrations from model changes
- Version control all migrations
- Support rollback capability

### Migration Commands

```bash
# Generate migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one version
alembic downgrade -1
```

---

## Data Integrity Rules

1. **User Deletion**: Cascades to delete all tasks and events
2. **Email Uniqueness**: Enforced at database level (case-insensitive)
3. **Position Ordering**: Tasks maintain unique positions per user
4. **Event Time Validation**: end_time >= start_time (enforced in application layer)
5. **Timestamp Updates**: `updated_at` automatically updated on modifications

---

## Performance Considerations

1. **Pagination**: Tasks and events paginated at 50 items per page
2. **Indexes**: All foreign keys and frequently queried columns indexed
3. **Connection Pooling**: 5-20 connections, 300s idle timeout
4. **Query Optimization**: Use eager loading for related data when needed
