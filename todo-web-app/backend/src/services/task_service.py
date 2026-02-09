from sqlmodel import Session, select, or_, and_, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from ..models.task import Task, TaskCreate, TaskUpdate, TaskResponse
from ..models.user import User
from ..exceptions import TaskNotFoundException, TaskOwnershipException, UserNotFoundException


class TaskService:
    """
    Service class for handling task-related operations.
    """

    def get_tasks_by_user(
        self, 
        session: Session, 
        user_id: UUID,
        q: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        tags: Optional[str] = None,
        due_after: Optional[datetime] = None,
        due_before: Optional[datetime] = None,
        is_recurring: Optional[bool] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ) -> List[TaskResponse]:
        """
        Get all tasks for a specific user with search, filter, and sort options.

        Args:
            session: Database session
            user_id: User's UUID
            q: Search query for title/description
            status: Filter by completion status (active/completed)
            priority: Filter by priority level
            tags: Filter by tags (comma-separated)
            due_after: Filter by due date after
            due_before: Filter by due date before
            is_recurring: Filter by recurring status
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)

        Returns:
            List of TaskResponse objects
        """
        statement = select(Task).where(Task.user_id == user_id)
        
        # Full-text search on title and description
        if q:
            statement = statement.where(
                or_(
                    Task.title.ilike(f"%{q}%"),
                    Task.description.ilike(f"%{q}%") if Task.description is not None else False
                )
            )
        
        # Filter by completion status
        if status:
            if status.lower() == "active":
                statement = statement.where(Task.completed == False)
            elif status.lower() == "completed":
                statement = statement.where(Task.completed == True)
        
        # Filter by priority
        if priority:
            priorities = [p.strip() for p in priority.split(',')]
            statement = statement.where(Task.priority.in_(priorities))
        
        # Filter by tags
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                statement = statement.where(func.json_contains(Task.tags, f'"{tag}"'))
        
        # Filter by due date range
        if due_after:
            statement = statement.where(Task.due_at >= due_after)
        if due_before:
            statement = statement.where(Task.due_at <= due_before)
        
        # Filter by recurring status
        if is_recurring is not None:
            statement = statement.where(Task.is_recurring == is_recurring)
        
        # Sorting
        valid_sort_fields = {
            "due_at": Task.due_at,
            "priority": Task.priority,
            "created_at": Task.created_at,
            "title": Task.title,
            "completed": Task.completed
        }
        
        if sort_by in valid_sort_fields:
            sort_field = valid_sort_fields[sort_by]
            if sort_order.lower() == "desc":
                statement = statement.order_by(sort_field.desc())
            else:
                statement = statement.order_by(sort_field.asc())
        else:
            # Default sorting
            statement = statement.order_by(Task.created_at.desc())
        
        tasks = session.exec(statement).all()

        return [TaskResponse.model_validate(task) for task in tasks]

    def get_task_by_id(self, session: Session, task_id: UUID, user_id: UUID) -> TaskResponse:
        """
        Get a specific task by ID for a user.

        Args:
            session: Database session
            task_id: Task's UUID
            user_id: User's UUID

        Returns:
            TaskResponse object

        Raises:
            TaskNotFoundException: If task doesn't exist
            TaskOwnershipException: If task doesn't belong to the user
        """
        task = session.get(Task, task_id)

        if not task:
            raise TaskNotFoundException()

        if task.user_id != user_id:
            raise TaskOwnershipException()

        return TaskResponse.model_validate(task)

    def create_task(self, session: Session, task_create: TaskCreate, user_id: UUID) -> TaskResponse:
        """
        Create a new task for a user.

        Args:
            session: Database session
            task_create: Task creation data
            user_id: User's UUID

        Returns:
            TaskResponse object

        Raises:
            UserNotFoundException: If user doesn't exist
        """
        # Verify user exists
        user = session.get(User, user_id)
        if not user:
            raise UserNotFoundException()

        # Create new task
        db_task = Task(
            title=task_create.title,
            description=task_create.description,
            due_date=task_create.due_date,
            user_id=user_id
        )

        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        return TaskResponse.model_validate(db_task)

    def update_task(self, session: Session, task_id: UUID, task_update: TaskUpdate, user_id: UUID) -> TaskResponse:
        """
        Update a task for a user.

        Args:
            session: Database session
            task_id: Task's UUID
            task_update: Task update data
            user_id: User's UUID

        Returns:
            TaskResponse object

        Raises:
            TaskNotFoundException: If task doesn't exist
            TaskOwnershipException: If task doesn't belong to the user
        """
        db_task = session.get(Task, task_id)

        if not db_task:
            raise TaskNotFoundException()

        if db_task.user_id != user_id:
            raise TaskOwnershipException()

        # Update task attributes
        for attr, value in task_update.model_dump(exclude_unset=True).items():
            setattr(db_task, attr, value)

        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        return TaskResponse.model_validate(db_task)

    def delete_task(self, session: Session, task_id: UUID, user_id: UUID) -> bool:
        """
        Delete a task for a user.

        Args:
            session: Database session
            task_id: Task's UUID
            user_id: User's UUID

        Returns:
            True if task was deleted successfully

        Raises:
            TaskNotFoundException: If task doesn't exist
            TaskOwnershipException: If task doesn't belong to the user
        """
        db_task = session.get(Task, task_id)

        if not db_task:
            raise TaskNotFoundException()

        if db_task.user_id != user_id:
            raise TaskOwnershipException()

        session.delete(db_task)
        session.commit()

        return True

    def reorder_tasks(self, session: Session, task_ids: List[UUID], user_id: UUID) -> bool:
        """
        Reorder tasks based on the provided list of task IDs.

        Args:
            session: Database session
            task_ids: Ordered list of task UUIDs
            user_id: User's UUID

        Returns:
            True if reorder was successful

        Raises:
            TaskNotFoundException: If any task doesn't exist
            TaskOwnershipException: If any task doesn't belong to the user
        """
        # Verify all tasks exist and belong to user
        for position, task_id in enumerate(task_ids):
            db_task = session.get(Task, task_id)

            if not db_task:
                raise TaskNotFoundException()

            if db_task.user_id != user_id:
                raise TaskOwnershipException()

            # Update position
            db_task.position = position
            db_task.updated_at = datetime.utcnow()
            session.add(db_task)

        session.commit()
        return True