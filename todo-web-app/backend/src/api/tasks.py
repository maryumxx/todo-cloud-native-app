from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from ..database import get_session
from ..api.deps import get_current_user_id
from ..models.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorderRequest
from ..services.task_service import TaskService


router = APIRouter( tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    q: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[str] = None,
    due_after: Optional[datetime] = None,
    due_before: Optional[datetime] = None,
    is_recurring: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the current user with search, filter, and sort options.
    """
    task_service = TaskService()
    return task_service.get_tasks_by_user(
        session, 
        current_user_id,
        q=q,
        status=status,
        priority=priority,
        tags=tags,
        due_after=due_after,
        due_before=due_before,
        is_recurring=is_recurring,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.post("/", response_model=TaskResponse)
def create_task(
    task_create: TaskCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the current user.
    """
    task_service = TaskService()
    return task_service.create_task(session, task_create, current_user_id)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID for the current user.
    """
    task_service = TaskService()
    return task_service.get_task_by_id(session, task_id, current_user_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Update a task for the current user.
    """
    task_service = TaskService()
    return task_service.update_task(session, task_id, task_update, current_user_id)


@router.delete("/{task_id}")
def delete_task(
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Delete a task for the current user.
    """
    task_service = TaskService()
    success = task_service.delete_task(session, task_id, current_user_id)
    if success:
        return {"message": "Task deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task"
        )


@router.post("/reorder")
def reorder_tasks(
    reorder_request: TaskReorderRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Reorder tasks based on drag-and-drop positions.
    """
    task_service = TaskService()
    success = task_service.reorder_tasks(session, reorder_request.task_ids, current_user_id)
    if success:
        return {"message": "Tasks reordered successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reorder tasks"
        )