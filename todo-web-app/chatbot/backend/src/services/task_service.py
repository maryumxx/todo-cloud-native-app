"""
Task Service layer for database operations related to tasks.
"""
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from ..models.task import Task, TaskStatus


class TaskService:
    """
    Service class for handling task-related database operations.
    """

    def __init__(self, session: Session):
        self.session = session

    def create_task(self, user_id: UUID, title: str, description: Optional[str] = None) -> Task:
        """
        Create a new task for the user.

        Args:
            user_id: The ID of the user creating the task
            title: The title of the task
            description: Optional description of the task

        Returns:
            The created Task object
        """
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            completed=False  # New tasks are not completed by default
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_task_by_id(self, task_id: UUID) -> Optional[Task]:
        """
        Get a task by its ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The Task object if found, None otherwise
        """
        statement = select(Task).where(Task.id == task_id)
        return self.session.exec(statement).first()

    def get_tasks_by_user_id(self, user_id: UUID, status_filter: Optional[str] = None) -> List[Task]:
        """
        Get all tasks for a user, optionally filtered by status.

        Args:
            user_id: The ID of the user
            status_filter: Optional filter ('all', 'pending', 'completed')

        Returns:
            List of Task objects
        """
        statement = select(Task).where(Task.user_id == user_id)

        if status_filter:
            if status_filter.lower() == 'pending':
                statement = statement.where(Task.completed == False)
            elif status_filter.lower() == 'completed':
                statement = statement.where(Task.completed == True)

        statement = statement.order_by(Task.created_at.desc())
        return self.session.exec(statement).all()

    def update_task(self, task_id: UUID, title: str, description: Optional[str], completed: bool) -> Task:
        """
        Update a task's details.

        Args:
            task_id: The ID of the task to update
            title: New title
            description: New description
            completed: New completion status

        Returns:
            The updated Task object
        """
        task = self.get_task_by_id(task_id)
        if task:
            task.title = title
            task.description = description
            task.completed = completed
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)
        return task

    def delete_task(self, task_id: UUID) -> bool:
        """
        Delete a task.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        task = self.get_task_by_id(task_id)
        if task:
            self.session.delete(task)
            self.session.commit()
            return True
        return False

    def toggle_task_completion(self, task_id: UUID) -> Optional[Task]:
        """
        Toggle the completion status of a task.

        Args:
            task_id: The ID of the task to toggle

        Returns:
            The updated Task object if successful, None otherwise
        """
        task = self.get_task_by_id(task_id)
        if task:
            task.completed = not task.completed
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)
        return task