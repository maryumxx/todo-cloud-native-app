"""
AI Chatbot endpoint integrated with Task Management.
Uses OpenAI function calling + direct TaskService access.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
import os
import json
from datetime import datetime, timedelta

# Import OpenAI with graceful fallback
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OpenAI = None
    OPENAI_AVAILABLE = False
    print("[WARNING] OpenAI package not installed. Chat functionality will be disabled.")

from ..database import get_session
from ..api.deps import get_current_user_id
from ..services.task_service import TaskService
from ..models.task import TaskCreate, TaskUpdate

router = APIRouter(tags=["Chat"])

# Initialize OpenAI client only if available
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = None
if OPENAI_AVAILABLE and OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)

# Task service instance
task_service = TaskService()

# =============================================================================
# Request/Response Models
# =============================================================================

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str

class ToolCallResponse(BaseModel):
    name: str
    arguments: dict
    result: Optional[dict] = None

class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: List[ToolCallResponse]
    task_changed: bool

# In-memory conversation storage
conversations: Dict[str, List[Dict[str, Any]]] = {}
conversation_counter = 0

# =============================================================================
# Date Parsing Helper
# =============================================================================

def parse_due_date(text: str) -> Optional[str]:
    """Parse natural language due dates to ISO format (YYYY-MM-DD)."""
    if not text:
        return None

    text_lower = text.lower().strip()
    today = datetime.now()

    if text_lower in ['today', 'tonight']:
        return today.strftime('%Y-%m-%d')
    elif text_lower == 'tomorrow':
        return (today + timedelta(days=1)).strftime('%Y-%m-%d')
    elif text_lower in ['next week', 'in a week']:
        return (today + timedelta(weeks=1)).strftime('%Y-%m-%d')

    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for i, day in enumerate(days):
        if day in text_lower:
            current_day = today.weekday()
            days_ahead = i - current_day
            if days_ahead <= 0:
                days_ahead += 7
            return (today + timedelta(days=days_ahead)).strftime('%Y-%m-%d')

    for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%B %d', '%b %d']:
        try:
            parsed = datetime.strptime(text, fmt)
            if parsed.year == 1900:
                parsed = parsed.replace(year=today.year)
            return parsed.strftime('%Y-%m-%d')
        except ValueError:
            continue

    return None

# =============================================================================
# Task Operations (Direct Database Access)
# =============================================================================

def add_task(session: Session, user_id: UUID, title: str, description: str = None, due_date: str = None) -> Dict[str, Any]:
    """Add a new task directly via TaskService."""
    try:
        parsed_due = None
        if due_date:
            parsed_date = parse_due_date(due_date)
            if parsed_date:
                from datetime import date
                parsed_due = date.fromisoformat(parsed_date)

        task_create = TaskCreate(
            title=title.strip(),
            description=description,
            due_date=parsed_due
        )
        task = task_service.create_task(session, task_create, user_id)
        return {
            "success": True,
            "task_id": str(task.id),
            "title": task.title,
            "due_date": str(task.due_date) if task.due_date else None,
            "message": f"Task created: {task.title}"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def list_tasks(session: Session, user_id: UUID, status_filter: str = "all") -> Dict[str, Any]:
    """List tasks directly via TaskService."""
    try:
        tasks = task_service.get_tasks_by_user(session, user_id)

        if status_filter == "pending":
            tasks = [t for t in tasks if not t.is_completed]
        elif status_filter in ["done", "completed"]:
            tasks = [t for t in tasks if t.is_completed]

        formatted_tasks = []
        for task in tasks:
            formatted_tasks.append({
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": "done" if task.is_completed else "pending",
                "due_date": str(task.due_date) if task.due_date else None
            })

        return {
            "success": True,
            "tasks": formatted_tasks,
            "count": len(formatted_tasks),
            "filter": status_filter
        }
    except Exception as e:
        return {"success": False, "message": str(e), "tasks": []}

def find_task_by_identifier(session: Session, user_id: UUID, identifier: str):
    """Find a task by ID or fuzzy title match."""
    tasks = task_service.get_tasks_by_user(session, user_id)

    # Try exact ID match
    for task in tasks:
        if str(task.id) == identifier:
            return task

    # Try fuzzy title match
    identifier_lower = identifier.lower()
    for task in tasks:
        if identifier_lower in task.title.lower():
            return task

    return None

def complete_task(session: Session, user_id: UUID, task_identifier: str) -> Dict[str, Any]:
    """Mark a task as completed."""
    try:
        task = find_task_by_identifier(session, user_id, task_identifier)
        if not task:
            return {
                "success": False,
                "message": f"Could not find task matching '{task_identifier}'. Try 'show my tasks' to see available tasks."
            }

        if task.is_completed:
            return {
                "success": True,
                "task_id": str(task.id),
                "title": task.title,
                "message": f"Task '{task.title}' is already marked as done!"
            }

        task_update = TaskUpdate(is_completed=True)
        updated_task = task_service.update_task(session, task.id, task_update, user_id)

        return {
            "success": True,
            "task_id": str(updated_task.id),
            "title": updated_task.title,
            "message": f"Task '{updated_task.title}' marked as done!"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def delete_task(session: Session, user_id: UUID, task_identifier: str) -> Dict[str, Any]:
    """Delete a task."""
    try:
        task = find_task_by_identifier(session, user_id, task_identifier)
        if not task:
            return {
                "success": False,
                "message": f"Could not find task matching '{task_identifier}'. Try 'show my tasks' to see available tasks."
            }

        task_title = task.title
        task_service.delete_task(session, task.id, user_id)

        return {
            "success": True,
            "title": task_title,
            "message": f"Deleted task '{task_title}'."
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def edit_task(session: Session, user_id: UUID, task_identifier: str, new_title: str = None, new_description: str = None, new_due_date: str = None) -> Dict[str, Any]:
    """Edit a task's details."""
    try:
        task = find_task_by_identifier(session, user_id, task_identifier)
        if not task:
            return {
                "success": False,
                "message": f"Could not find task matching '{task_identifier}'. Try 'show my tasks' to see available tasks."
            }

        updates = {}
        if new_title:
            updates["title"] = new_title.strip()
        if new_description is not None:
            updates["description"] = new_description
        if new_due_date:
            parsed_date = parse_due_date(new_due_date)
            if parsed_date:
                from datetime import date
                updates["due_date"] = date.fromisoformat(parsed_date)

        if not updates:
            return {
                "success": False,
                "message": "No changes specified. Please provide a new title, description, or due date."
            }

        task_update = TaskUpdate(**updates)
        updated_task = task_service.update_task(session, task.id, task_update, user_id)

        return {
            "success": True,
            "task_id": str(updated_task.id),
            "old_title": task.title,
            "new_title": updated_task.title,
            "message": f"Updated task: '{updated_task.title}'"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def clear_completed_tasks(session: Session, user_id: UUID) -> Dict[str, Any]:
    """Delete all completed tasks."""
    try:
        tasks = task_service.get_tasks_by_user(session, user_id)
        completed_tasks = [t for t in tasks if t.is_completed]

        if not completed_tasks:
            return {
                "success": True,
                "deleted_count": 0,
                "message": "No completed tasks to clear."
            }

        deleted_count = 0
        for task in completed_tasks:
            try:
                task_service.delete_task(session, task.id, user_id)
                deleted_count += 1
            except:
                pass

        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Cleared {deleted_count} completed task{'s' if deleted_count != 1 else ''}."
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def uncomplete_task(session: Session, user_id: UUID, task_identifier: str) -> Dict[str, Any]:
    """Mark a task as pending again."""
    try:
        task = find_task_by_identifier(session, user_id, task_identifier)
        if not task:
            return {
                "success": False,
                "message": f"Could not find task matching '{task_identifier}'."
            }

        if not task.is_completed:
            return {
                "success": True,
                "task_id": str(task.id),
                "title": task.title,
                "message": f"Task '{task.title}' is already pending."
            }

        task_update = TaskUpdate(is_completed=False)
        updated_task = task_service.update_task(session, task.id, task_update, user_id)

        return {
            "success": True,
            "task_id": str(updated_task.id),
            "title": updated_task.title,
            "message": f"Task '{updated_task.title}' marked as pending again."
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

# =============================================================================
# OpenAI Tools Definition
# =============================================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task/todo item for the user. Use this when the user wants to add, create, or remember something to do.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The title/name of the task."},
                    "description": {"type": "string", "description": "Optional additional details about the task."},
                    "due_date": {"type": "string", "description": "Optional due date. Can be natural language like 'tomorrow', 'Friday', 'next week'."}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Show the user's tasks/todos. Use this when user asks to see, show, list, or view their tasks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status_filter": {"type": "string", "enum": ["all", "pending", "done"], "description": "Filter tasks by status."}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as done/completed. Use when user wants to complete, finish, mark done, or check off a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {"type": "string", "description": "Part of the task title to search for."}
                },
                "required": ["task_identifier"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete/remove a task permanently. Use when user wants to delete, remove, or get rid of a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {"type": "string", "description": "Part of the task title to search for."}
                },
                "required": ["task_identifier"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "edit_task",
            "description": "Edit/update an existing task's title, description, or due date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {"type": "string", "description": "Part of the task title to find."},
                    "new_title": {"type": "string", "description": "The new title for the task (optional)."},
                    "new_description": {"type": "string", "description": "The new description for the task (optional)."},
                    "new_due_date": {"type": "string", "description": "The new due date for the task (optional)."}
                },
                "required": ["task_identifier"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "clear_completed_tasks",
            "description": "Delete all completed/done tasks at once.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "uncomplete_task",
            "description": "Mark a completed task as pending again.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {"type": "string", "description": "Part of the task title."}
                },
                "required": ["task_identifier"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are a friendly and helpful task management assistant. You help users manage their tasks through natural conversation.

## Your Capabilities:
- Add new tasks (with optional description and due dates)
- List tasks (all, pending, or completed)
- Mark tasks as done
- Delete tasks
- Edit task details
- Clear all completed tasks
- Reopen completed tasks

## Guidelines:
1. Be conversational and friendly
2. Always use the provided tools when a user wants to manage tasks
3. Confirm actions (e.g., "Added task: Buy groceries")
4. If unclear which task the user means, ask for clarification

## Example Interactions:
- User: "add buy milk" -> Add task, respond: "Added: Buy milk"
- User: "show my tasks" -> List all tasks
- User: "done with groceries" -> Complete the task with "groceries" in title

Changes appear in the user's dashboard immediately!"""

MODIFYING_TOOLS = {"add_task", "complete_task", "delete_task", "edit_task", "clear_completed_tasks", "uncomplete_task"}

# =============================================================================
# Tool Execution
# =============================================================================

def execute_tool(tool_name: str, arguments: Dict, session: Session, user_id: UUID) -> Dict[str, Any]:
    """Execute a tool function with the given arguments."""
    tool_functions = {
        "add_task": lambda args: add_task(session, user_id, **args),
        "list_tasks": lambda args: list_tasks(session, user_id, **args),
        "complete_task": lambda args: complete_task(session, user_id, **args),
        "delete_task": lambda args: delete_task(session, user_id, **args),
        "edit_task": lambda args: edit_task(session, user_id, **args),
        "clear_completed_tasks": lambda args: clear_completed_tasks(session, user_id),
        "uncomplete_task": lambda args: uncomplete_task(session, user_id, **args),
    }

    if tool_name in tool_functions:
        return tool_functions[tool_name](arguments)
    else:
        return {"success": False, "message": f"Unknown tool: {tool_name}"}

# =============================================================================
# Chat Endpoint
# =============================================================================

@router.post("/", response_model=ChatResponse)
def chat_endpoint(
    request: ChatRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Process a chat message and return AI response with task operations."""
    global conversation_counter

    if not OPENAI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chat service unavailable: OpenAI package not installed")

    if not client:
        raise HTTPException(status_code=503, detail="Chat service unavailable: OpenAI API key not configured")

    try:
        # Get or create conversation
        conv_key = f"{current_user_id}_{request.conversation_id}" if request.conversation_id else None

        if conv_key and conv_key in conversations:
            messages = conversations[conv_key]
        else:
            conversation_counter += 1
            conv_id = request.conversation_id or conversation_counter
            conv_key = f"{current_user_id}_{conv_id}"
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            conversations[conv_key] = messages

        # Add user message
        messages.append({"role": "user", "content": request.message})

        # Call OpenAI with tools
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1000
        )

        assistant_message = response.choices[0].message
        tool_calls_made = []
        task_changed = False

        # Process tool calls if any
        if assistant_message.tool_calls:
            messages.append({
                "role": "assistant",
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })

            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                result = execute_tool(function_name, arguments, session, current_user_id)

                if function_name in MODIFYING_TOOLS and result.get("success", False):
                    task_changed = True

                tool_calls_made.append(ToolCallResponse(
                    name=function_name,
                    arguments=arguments,
                    result=result
                ))

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result)
                })

            final_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=1000
            )
            final_content = final_response.choices[0].message.content or "Done!"
        else:
            final_content = assistant_message.content or "I'm here to help with your tasks!"

        messages.append({"role": "assistant", "content": final_content})

        # Keep conversation history manageable
        if len(messages) > 21:
            messages = [messages[0]] + messages[-20:]
            conversations[conv_key] = messages

        conv_id = int(conv_key.split("_")[1])

        return ChatResponse(
            conversation_id=conv_id,
            response=final_content,
            tool_calls=tool_calls_made,
            task_changed=task_changed
        )

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
