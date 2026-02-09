"""
MCP (Model Context Protocol) Server Foundation
This module implements the MCP server that exposes task operations as tools
for the AI agent to use.
"""
import asyncio
from typing import Dict, Any, List
from uuid import UUID
import os
from dotenv import load_dotenv

load_dotenv()

# Import required models and services
from ..models.task import Task
from ..models.conversation import Conversation
from ..models.message import Message
from ..models.user import User
from ..database.connection import SessionLocal, get_session
from ..services.task_service import TaskService
from ..services.conversation_service import ConversationService
from ..services.message_service import MessageService
from ..services.user_service import UserService

# Import SQLModel components
from sqlmodel import Session, select, and_

# Define tool contracts for MCP
class MCPTaskTools:
    """
    MCP Tools for task operations that follow the required contract.
    These tools are stateless functions that interact with the database via SQLModel.
    """

    @staticmethod
    def add_task(user_id: str, title: str, description: str = None) -> Dict[str, Any]:
        """
        Creates a new task for the user.

        Args:
            user_id: The ID of the user creating the task
            title: The title of the task
            description: Optional description of the task

        Returns:
            Dictionary with the created task details
        """
        with SessionLocal() as session:
            # Validate user exists
            user_service = UserService(session)
            user = user_service.get_user_by_id(UUID(user_id))
            if not user:
                return {"error": "User not found", "status": "error"}

            # Create task using service
            task_service = TaskService(session)
            new_task = task_service.create_task(
                user_id=UUID(user_id),
                title=title,
                description=description
            )

            return {
                "id": str(new_task.id),
                "user_id": str(new_task.user_id),
                "title": new_task.title,
                "description": new_task.description,
                "completed": new_task.completed,
                "created_at": new_task.created_at.isoformat(),
                "updated_at": new_task.updated_at.isoformat(),
                "status": "success"
            }

    @staticmethod
    def list_tasks(user_id: str, status_filter: str = None) -> List[Dict[str, Any]]:
        """
        Returns tasks for the user based on filter.

        Args:
            user_id: The ID of the user whose tasks to retrieve
            status_filter: Optional filter ('all', 'pending', 'completed')

        Returns:
            List of tasks matching the criteria
        """
        with SessionLocal() as session:
            # Validate user exists
            user_service = UserService(session)
            user = user_service.get_user_by_id(UUID(user_id))
            if not user:
                return [{"error": "User not found", "status": "error"}]

            # Get tasks using service
            task_service = TaskService(session)
            tasks = task_service.get_tasks_by_user_id(UUID(user_id), status_filter)

            return [
                {
                    "id": str(task.id),
                    "user_id": str(task.user_id),
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                }
                for task in tasks
            ]

    @staticmethod
    def complete_task(user_id: str, task_id: str) -> Dict[str, Any]:
        """
        Marks a task as completed.

        Args:
            user_id: The ID of the user
            task_id: The ID of the task to complete

        Returns:
            Dictionary with operation result
        """
        with SessionLocal() as session:
            # Validate user and task exist
            user_service = UserService(session)
            user = user_service.get_user_by_id(UUID(user_id))
            if not user:
                return {"error": "User not found", "status": "error"}

            task_service = TaskService(session)
            task = task_service.get_task_by_id(UUID(task_id))
            if not task:
                return {"error": "Task not found", "status": "error"}

            # Check if user owns the task
            if str(task.user_id) != user_id:
                return {"error": "Unauthorized: Task does not belong to user", "status": "error"}

            # Complete the task
            updated_task = task_service.update_task(
                task_id=UUID(task_id),
                title=task.title,
                description=task.description,
                completed=True
            )

            return {
                "id": str(updated_task.id),
                "user_id": str(updated_task.user_id),
                "title": updated_task.title,
                "description": updated_task.description,
                "completed": updated_task.completed,
                "created_at": updated_task.created_at.isoformat(),
                "updated_at": updated_task.updated_at.isoformat(),
                "status": "success"
            }

    @staticmethod
    def delete_task(user_id: str, task_id: str) -> Dict[str, Any]:
        """
        Deletes a task.

        Args:
            user_id: The ID of the user
            task_id: The ID of the task to delete

        Returns:
            Dictionary with operation result
        """
        with SessionLocal() as session:
            # Validate user and task exist
            user_service = UserService(session)
            user = user_service.get_user_by_id(UUID(user_id))
            if not user:
                return {"error": "User not found", "status": "error"}

            task_service = TaskService(session)
            task = task_service.get_task_by_id(UUID(task_id))
            if not task:
                return {"error": "Task not found", "status": "error"}

            # Check if user owns the task
            if str(task.user_id) != user_id:
                return {"error": "Unauthorized: Task does not belong to user", "status": "error"}

            # Delete the task
            success = task_service.delete_task(UUID(task_id))

            if success:
                return {
                    "id": str(task.id),
                    "message": "Task deleted successfully",
                    "status": "success"
                }
            else:
                return {
                    "error": "Failed to delete task",
                    "status": "error"
                }

    @staticmethod
    def update_task(user_id: str, task_id: str, title: str = None, description: str = None) -> Dict[str, Any]:
        """
        Updates a task's title and/or description.

        Args:
            user_id: The ID of the user
            task_id: The ID of the task to update
            title: New title (optional)
            description: New description (optional)

        Returns:
            Dictionary with updated task details
        """
        with SessionLocal() as session:
            # Validate user and task exist
            user_service = UserService(session)
            user = user_service.get_user_by_id(UUID(user_id))
            if not user:
                return {"error": "User not found", "status": "error"}

            task_service = TaskService(session)
            task = task_service.get_task_by_id(UUID(task_id))
            if not task:
                return {"error": "Task not found", "status": "error"}

            # Check if user owns the task
            if str(task.user_id) != user_id:
                return {"error": "Unauthorized: Task does not belong to user", "status": "error"}

            # Update the task
            updated_task = task_service.update_task(
                task_id=UUID(task_id),
                title=title or task.title,
                description=description if description is not None else task.description,
                completed=task.completed  # Keep current completion status
            )

            return {
                "id": str(updated_task.id),
                "user_id": str(updated_task.user_id),
                "title": updated_task.title,
                "description": updated_task.description,
                "completed": updated_task.completed,
                "created_at": updated_task.created_at.isoformat(),
                "updated_at": updated_task.updated_at.isoformat(),
                "status": "success"
            }


# MCP Server class that registers tools
class MCPServer:
    """
    MCP Server that registers tools for the AI agent.
    This server exposes task operations as stateless functions.
    """

    def __init__(self):
        self.tools = MCPTaskTools()
        self.registered_tools = {}
        self._register_tools()

    def _register_tools(self):
        """Register all available tools with the MCP server."""
        self.registered_tools = {
            "add_task": {
                "function": self.tools.add_task,
                "description": "Creates a new task for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "The ID of the user creating the task"},
                        "title": {"type": "string", "description": "The title of the task"},
                        "description": {"type": "string", "description": "Optional description of the task"}
                    },
                    "required": ["user_id", "title"]
                }
            },
            "list_tasks": {
                "function": self.tools.list_tasks,
                "description": "Returns tasks for the user based on filter",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "The ID of the user whose tasks to retrieve"},
                        "status_filter": {"type": "string", "description": "Optional filter ('all', 'pending', 'completed')"}
                    },
                    "required": ["user_id"]
                }
            },
            "complete_task": {
                "function": self.tools.complete_task,
                "description": "Marks a task as completed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "The ID of the user"},
                        "task_id": {"type": "string", "description": "The ID of the task to complete"}
                    },
                    "required": ["user_id", "task_id"]
                }
            },
            "delete_task": {
                "function": self.tools.delete_task,
                "description": "Deletes a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "The ID of the user"},
                        "task_id": {"type": "string", "description": "The ID of the task to delete"}
                    },
                    "required": ["user_id", "task_id"]
                }
            },
            "update_task": {
                "function": self.tools.update_task,
                "description": "Updates a task's title and/or description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "The ID of the user"},
                        "task_id": {"type": "string", "description": "The ID of the task to update"},
                        "title": {"type": "string", "description": "New title (optional)"},
                        "description": {"type": "string", "description": "New description (optional)"}
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        }

    def get_tool(self, tool_name: str):
        """Get a registered tool by name."""
        return self.registered_tools.get(tool_name)

    def execute_tool(self, tool_name: str, **kwargs):
        """Execute a registered tool with the provided arguments."""
        tool_info = self.get_tool(tool_name)
        if not tool_info:
            return {"error": f"Tool '{tool_name}' not found", "status": "error"}

        try:
            # Call the function with the provided arguments
            result = tool_info["function"](**kwargs)
            return result
        except Exception as e:
            return {"error": f"Error executing tool: {str(e)}", "status": "error"}


# Global MCP server instance
mcp_server = MCPServer()