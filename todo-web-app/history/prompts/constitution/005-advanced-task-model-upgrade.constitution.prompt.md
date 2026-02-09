---
id: 005
title: "Advanced Task Model Upgrade"
stage: constitution
date: 2026-02-03
surface: agent
model: claude-opus-4-5-20251101
feature: task-management
branch: main
user: Maryam
command: sp.constitution
labels: ["backend", "fastapi", "sqlmodel", "task-model", "schema", "database"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/models/task.py
  - backend/src/models/__init__.py
  - backend/src/services/task_service.py
  - backend/src/schemas/__init__.py
  - backend/src/schemas/task.py
  - backend/src/schemas/user.py
  - backend/src/schemas/event.py
  - backend/src/schemas/response.py
tests: []
---

# Prompt History Record

## Prompt (Verbatim)

sp.constitution You are a senior backend architect.
I am upgrading a FastAPI Todo backend from basic CRUD to an advanced task system.

Modify my existing Task model and schemas with the following production-level fields:

New Fields to Add:

due_at: datetime | None → When the task is due

remind_at: datetime | None → When reminder should trigger

is_recurring: bool → Whether task repeats

recurrence_rule: str | None → Cron-style or RRULE string (e.g. "FREQ=DAILY")

priority: str → Enum: "low", "medium", "high"

tags: List[str] → List of labels

Requirements:

Use SQLModel or SQLAlchemy model

Update Pydantic schemas accordingly

Ensure nullable fields where appropriate

Set default priority = "medium"

Ensure tags default to empty list

Keep backward compatibility with existing tasks

Output:

Updated database model

Updated CreateTask schema

Updated Response schema

## Response Summary

Updated the Task model and schemas with production-level advanced fields:

1. **Database Model (Task)** - Added 6 new fields:
   - `due_at: Optional[datetime]` - Full datetime for due timestamp (indexed)
   - `remind_at: Optional[datetime]` - Reminder trigger datetime
   - `is_recurring: bool = False` - Recurrence flag
   - `recurrence_rule: Optional[str]` - RRULE string (max 255 chars)
   - `priority: str = "medium"` - Enum-like field (low/medium/high)
   - `tags: List[str] = []` - JSON column for labels

2. **TaskPriority Enum** - Created str Enum for type safety

3. **TaskCreate Schema** - Added all new fields with defaults for backward compatibility

4. **TaskUpdate Schema** - Added optional versions of all new fields

5. **TaskResponse Schema** - Extended with all new fields for API responses

6. **Backward Compatibility** - Retained `due_date` field as legacy, all new fields have sensible defaults

7. **Fixed Broken Imports** - Created missing schema files (task.py, user.py, event.py, response.py)

## Outcome

- Task model upgraded with advanced scheduling, recurrence, priority, and tagging
- Existing API contracts preserved (all new fields optional/defaulted)
- Schema files properly organized for future maintenance
- TaskService updated to handle new fields during creation

## Evaluation

- [x] All requested fields added with correct types
- [x] Nullable fields marked as Optional
- [x] Default priority = "medium"
- [x] Tags default to empty list []
- [x] Backward compatible (existing tasks unaffected)
- [x] SQLModel with JSON column for tags array
