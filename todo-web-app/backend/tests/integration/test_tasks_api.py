import pytest
from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import patch, Mock
from uuid import UUID


@pytest.fixture
def client():
    """Create a test client for the API."""
    with TestClient(app) as test_client:
        yield test_client


def test_create_task_endpoint(client):
    """Test the task creation endpoint."""
    # Mock token validation
    with patch('src.api.deps.get_current_user_id', return_value=UUID("12345678-1234-5678-1234-567812345678")), \
         patch('src.services.task_service.TaskService.create_task') as mock_create_task:

        # Mock the return value of the service
        mock_task = Mock()
        mock_task.id = "task-id"
        mock_task.title = "Test Task"
        mock_task.user_id = "user-id"
        mock_create_task.return_value = mock_task

        response = client.post(
            "/api/tasks/",
            json={
                "title": "Test Task",
                "description": "Test Description"
            },
            headers={"Authorization": "Bearer fake-token"}
        )

        assert response.status_code == 200


def test_get_tasks_endpoint(client):
    """Test the get tasks endpoint."""
    # Mock token validation
    with patch('src.api.deps.get_current_user_id', return_value=UUID("12345678-1234-5678-1234-567812345678")), \
         patch('src.services.task_service.TaskService.get_tasks_by_user', return_value=[]):

        response = client.get("/api/tasks/", headers={"Authorization": "Bearer fake-token"})

        assert response.status_code == 200
        assert response.json() == []


def test_update_task_endpoint(client):
    """Test the update task endpoint."""
    # Mock token validation
    with patch('src.api.deps.get_current_user_id', return_value=UUID("12345678-1234-5678-1234-567812345678")), \
         patch('src.services.task_service.TaskService.update_task') as mock_update_task:

        # Mock the return value of the service
        mock_task = Mock()
        mock_task.id = "task-id"
        mock_task.title = "Updated Task"
        mock_task.user_id = "user-id"
        mock_update_task.return_value = mock_task

        response = client.put(
            "/api/tasks/task-id",
            json={
                "title": "Updated Task"
            },
            headers={"Authorization": "Bearer fake-token"}
        )

        assert response.status_code == 200


def test_delete_task_endpoint(client):
    """Test the delete task endpoint."""
    # Mock token validation
    with patch('src.api.deps.get_current_user_id', return_value=UUID("12345678-1234-5678-1234-567812345678")), \
         patch('src.services.task_service.TaskService.delete_task', return_value=True):

        response = client.delete("/api/tasks/task-id", headers={"Authorization": "Bearer fake-token"})

        assert response.status_code == 200
        assert response.json()["message"] == "Task deleted successfully"