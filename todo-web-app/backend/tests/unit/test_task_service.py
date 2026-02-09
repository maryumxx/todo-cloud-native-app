import pytest
from unittest.mock import Mock
from sqlmodel import Session
from src.services.task_service import TaskService
from src.models.task import TaskCreate
from src.exceptions import TaskNotFoundException, TaskOwnershipException, UserNotFoundException
from uuid import UUID


def test_get_tasks_by_user():
    """Test retrieving tasks for a specific user."""
    task_service = TaskService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock tasks
    mock_tasks = [
        Mock(),
        Mock()
    ]
    mock_tasks[0].id = "task-uuid-1"
    mock_tasks[0].title = "Test Task 1"
    mock_tasks[0].user_id = "user-uuid"
    mock_tasks[1].id = "task-uuid-2"
    mock_tasks[1].title = "Test Task 2"
    mock_tasks[1].user_id = "user-uuid"

    # Mock the exec().all() call
    mock_exec_result = Mock()
    mock_exec_result.all.return_value = mock_tasks
    mock_session.exec.return_value = mock_exec_result

    user_id = UUID("12345678-1234-5678-1234-567812345678")

    tasks = task_service.get_tasks_by_user(mock_session, user_id)

    assert len(tasks) == 2
    assert mock_session.exec.called


def test_get_task_by_id_success():
    """Test retrieving a specific task by ID for the correct user."""
    task_service = TaskService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock task
    mock_task = Mock()
    mock_task.id = "task-uuid"
    mock_task.title = "Test Task"
    mock_task.user_id = "user-uuid"

    mock_session.get.return_value = mock_task

    task_id = UUID("12345678-1234-5678-1234-567812345678")
    user_id = UUID("87654321-4321-8765-4321-87654321dcba")

    # Since the user_ids match in this mock, it should work
    task = task_service.get_task_by_id(mock_session, task_id, user_id)

    assert task is not None


def test_create_task_success():
    """Test creating a new task for a user."""
    task_service = TaskService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock user to verify it exists
    mock_user = Mock()
    mock_session.get.return_value = mock_user

    # Mock task creation data
    task_create = TaskCreate(
        title="New Task",
        description="Task description",
        is_completed=False
    )

    user_id = UUID("12345678-1234-5678-1234-567812345678")

    with pytest.warns(None) as record:  # Catch warnings
        # Call create_task
        result = task_service.create_task(mock_session, task_create, user_id)

    # Verify session methods were called
    assert mock_session.add.called
    assert mock_session.commit.called
    assert mock_session.refresh.called


def test_update_task_success():
    """Test updating an existing task."""
    task_service = TaskService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock existing task
    mock_task = Mock()
    mock_task.user_id = "user-uuid"
    mock_task.title = "Old Title"
    mock_session.get.return_value = mock_task

    # Mock update data
    task_update = Mock()
    task_update.model_dump.return_value = {"title": "New Title", "is_completed": True}

    task_id = UUID("12345678-1234-5678-1234-567812345678")
    user_id = UUID("12345678-1234-5678-1234-567812345678")

    updated_task = task_service.update_task(mock_session, task_id, task_update, user_id)

    # Verify the task was updated
    assert mock_task.title == "New Title"
    assert mock_task.is_completed is True
    assert mock_session.add.called
    assert mock_session.commit.called
    assert mock_session.refresh.called


def test_delete_task_success():
    """Test deleting an existing task."""
    task_service = TaskService()

    # Mock session
    mock_session = Mock(spec=Session)

    # Mock existing task
    mock_task = Mock()
    mock_task.user_id = "user-uuid"
    mock_session.get.return_value = mock_task

    task_id = UUID("12345678-1234-5678-1234-567812345678")
    user_id = UUID("12345678-1234-5678-1234-567812345678")

    result = task_service.delete_task(mock_session, task_id, user_id)

    # Verify the task was deleted
    assert result is True
    assert mock_session.delete.called
    assert mock_session.commit.called