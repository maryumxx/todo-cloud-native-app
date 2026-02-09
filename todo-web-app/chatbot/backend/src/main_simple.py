"""
AI Chatbot integrated with Main Todo App Backend
Uses OpenAI function calling + Main Backend API for task management
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from openai import OpenAI
import os
import json
import httpx
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# =============================================================================
# Configuration
# =============================================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MAIN_BACKEND_URL = os.getenv("MAIN_BACKEND_URL", "http://localhost:8000")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Allowed origins for CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", ""),
    os.getenv("VERCEL_URL", ""),
    os.getenv("RENDER_EXTERNAL_URL", ""),
]
ALLOWED_ORIGINS = [o for o in ALLOWED_ORIGINS if o]
if ENVIRONMENT == "development":
    ALLOWED_ORIGINS.append("*")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# =============================================================================
# Main Backend API Client
# =============================================================================

class MainBackendClient:
    """Client for calling the main todo app backend API."""

    def __init__(self, base_url: str):
        self.base_url = base_url

    async def _request(self, method: str, endpoint: str, token: str, json_data: dict = None) -> Dict[str, Any]:
        """Make authenticated request to main backend."""
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            try:
                if method == "GET":
                    response = await client.get(f"{self.base_url}{endpoint}", headers=headers)
                elif method == "POST":
                    response = await client.post(f"{self.base_url}{endpoint}", headers=headers, json=json_data)
                elif method == "PUT":
                    response = await client.put(f"{self.base_url}{endpoint}", headers=headers, json=json_data)
                elif method == "DELETE":
                    response = await client.delete(f"{self.base_url}{endpoint}", headers=headers)
                else:
                    return {"success": False, "error": f"Unknown method: {method}"}

                if response.status_code == 401:
                    return {"success": False, "error": "Authentication failed. Please log in again."}
                elif response.status_code == 404:
                    return {"success": False, "error": "Task not found."}
                elif response.status_code >= 400:
                    detail = response.json().get("detail", "Request failed")
                    return {"success": False, "error": detail}

                return {"success": True, "data": response.json()}
            except httpx.ConnectError:
                return {"success": False, "error": "Could not connect to the task server."}
            except Exception as e:
                return {"success": False, "error": str(e)}

    async def get_tasks(self, token: str) -> Dict[str, Any]:
        """Get all tasks for the authenticated user."""
        return await self._request("GET", "/api/tasks/", token)

    async def create_task(self, token: str, title: str, description: str = None, due_date: str = None) -> Dict[str, Any]:
        """Create a new task."""
        data = {"title": title}
        if description:
            data["description"] = description
        if due_date:
            data["due_date"] = due_date
        return await self._request("POST", "/api/tasks/", token, data)

    async def update_task(self, token: str, task_id: str, updates: dict) -> Dict[str, Any]:
        """Update a task."""
        return await self._request("PUT", f"/api/tasks/{task_id}", token, updates)

    async def delete_task(self, token: str, task_id: str) -> Dict[str, Any]:
        """Delete a task."""
        return await self._request("DELETE", f"/api/tasks/{task_id}", token)


backend_client = MainBackendClient(MAIN_BACKEND_URL)

# =============================================================================
# Task Operations (via Main Backend)
# =============================================================================

def parse_due_date(text: str) -> Optional[str]:
    """Parse natural language due dates to ISO format (YYYY-MM-DD)."""
    if not text:
        return None

    text_lower = text.lower().strip()
    today = datetime.now()

    # Handle relative dates
    if text_lower in ['today', 'tonight']:
        return today.strftime('%Y-%m-%d')
    elif text_lower == 'tomorrow':
        return (today + timedelta(days=1)).strftime('%Y-%m-%d')
    elif text_lower in ['next week', 'in a week']:
        return (today + timedelta(weeks=1)).strftime('%Y-%m-%d')

    # Handle day names
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for i, day in enumerate(days):
        if day in text_lower:
            current_day = today.weekday()
            days_ahead = i - current_day
            if days_ahead <= 0:
                days_ahead += 7
            return (today + timedelta(days=days_ahead)).strftime('%Y-%m-%d')

    # Try to parse as date
    for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%B %d', '%b %d']:
        try:
            parsed = datetime.strptime(text, fmt)
            if parsed.year == 1900:
                parsed = parsed.replace(year=today.year)
            return parsed.strftime('%Y-%m-%d')
        except ValueError:
            continue

    return text  # Return as-is if we can't parse


async def add_task(token: str, title: str, description: str = None, due_date: str = None) -> Dict[str, Any]:
    """Add a new task via main backend."""
    parsed_due = parse_due_date(due_date) if due_date else None
    result = await backend_client.create_task(token, title.strip(), description, parsed_due)

    if result["success"]:
        task = result["data"]
        return {
            "success": True,
            "task_id": task["id"],
            "title": task["title"],
            "due_date": task.get("due_date"),
            "message": f"Task created: {task['title']}"
        }
    else:
        return {"success": False, "message": result["error"]}


async def list_tasks(token: str, status_filter: str = "all") -> Dict[str, Any]:
    """List tasks from main backend."""
    result = await backend_client.get_tasks(token)

    if not result["success"]:
        return {"success": False, "message": result["error"], "tasks": []}

    tasks = result["data"]

    # Filter by status
    if status_filter == "pending":
        tasks = [t for t in tasks if not t.get("is_completed", False)]
    elif status_filter in ["done", "completed"]:
        tasks = [t for t in tasks if t.get("is_completed", False)]

    # Format tasks for display
    formatted_tasks = []
    for task in tasks:
        formatted_tasks.append({
            "id": task["id"],
            "title": task["title"],
            "description": task.get("description"),
            "status": "done" if task.get("is_completed") else "pending",
            "due_date": task.get("due_date"),
            "created_at": task.get("created_at")
        })

    return {
        "success": True,
        "tasks": formatted_tasks,
        "count": len(formatted_tasks),
        "filter": status_filter
    }


async def find_task_by_id_or_title(token: str, identifier: str) -> Optional[Dict]:
    """Find a task by ID or fuzzy title match."""
    result = await backend_client.get_tasks(token)
    if not result["success"]:
        return None

    tasks = result["data"]

    # Try exact ID match first (UUIDs)
    for task in tasks:
        if task["id"] == identifier:
            return task

    # Try fuzzy title match
    identifier_lower = identifier.lower()
    for task in tasks:
        if identifier_lower in task["title"].lower():
            return task

    return None


async def complete_task(token: str, task_identifier: str) -> Dict[str, Any]:
    """Mark a task as completed."""
    task = await find_task_by_id_or_title(token, task_identifier)

    if not task:
        return {
            "success": False,
            "message": f"Could not find task matching '{task_identifier}'. Try 'show my tasks' to see available tasks."
        }

    if task.get("is_completed"):
        return {
            "success": True,
            "task_id": task["id"],
            "title": task["title"],
            "message": f"Task '{task['title']}' is already marked as done!"
        }

    result = await backend_client.update_task(token, task["id"], {"is_completed": True})

    if result["success"]:
        return {
            "success": True,
            "task_id": task["id"],
            "title": task["title"],
            "message": f"Task '{task['title']}' marked as done!"
        }
    else:
        return {"success": False, "message": result["error"]}


async def delete_task(token: str, task_identifier: str) -> Dict[str, Any]:
    """Delete a task."""
    task = await find_task_by_id_or_title(token, task_identifier)

    if not task:
        return {
            "success": False,
            "message": f"Could not find task matching '{task_identifier}'. Try 'show my tasks' to see available tasks."
        }

    result = await backend_client.delete_task(token, task["id"])

    if result["success"]:
        return {
            "success": True,
            "task_id": task["id"],
            "title": task["title"],
            "message": f"Deleted task '{task['title']}'."
        }
    else:
        return {"success": False, "message": result["error"]}


async def edit_task(token: str, task_identifier: str, new_title: str = None, new_description: str = None, new_due_date: str = None) -> Dict[str, Any]:
    """Edit a task's details."""
    task = await find_task_by_id_or_title(token, task_identifier)

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
        updates["due_date"] = parse_due_date(new_due_date)

    if not updates:
        return {
            "success": False,
            "message": "No changes specified. Please provide a new title, description, or due date."
        }

    result = await backend_client.update_task(token, task["id"], updates)

    if result["success"]:
        return {
            "success": True,
            "task_id": task["id"],
            "old_title": task["title"],
            "new_title": updates.get("title", task["title"]),
            "message": f"Updated task: '{updates.get('title', task['title'])}'"
        }
    else:
        return {"success": False, "message": result["error"]}


async def clear_completed_tasks(token: str) -> Dict[str, Any]:
    """Delete all completed tasks."""
    result = await backend_client.get_tasks(token)
    if not result["success"]:
        return {"success": False, "message": result["error"]}

    completed_tasks = [t for t in result["data"] if t.get("is_completed")]

    if not completed_tasks:
        return {
            "success": True,
            "deleted_count": 0,
            "message": "No completed tasks to clear."
        }

    deleted_count = 0
    for task in completed_tasks:
        del_result = await backend_client.delete_task(token, task["id"])
        if del_result["success"]:
            deleted_count += 1

    return {
        "success": True,
        "deleted_count": deleted_count,
        "message": f"Cleared {deleted_count} completed task{'s' if deleted_count != 1 else ''}."
    }


async def uncomplete_task(token: str, task_identifier: str) -> Dict[str, Any]:
    """Mark a task as pending again."""
    task = await find_task_by_id_or_title(token, task_identifier)

    if not task:
        return {
            "success": False,
            "message": f"Could not find task matching '{task_identifier}'."
        }

    if not task.get("is_completed"):
        return {
            "success": True,
            "task_id": task["id"],
            "title": task["title"],
            "message": f"Task '{task['title']}' is already pending."
        }

    result = await backend_client.update_task(token, task["id"], {"is_completed": False})

    if result["success"]:
        return {
            "success": True,
            "task_id": task["id"],
            "title": task["title"],
            "message": f"Task '{task['title']}' marked as pending again."
        }
    else:
        return {"success": False, "message": result["error"]}


# =============================================================================
# OpenAI Function Definitions
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
                    "title": {
                        "type": "string",
                        "description": "The title/name of the task. Extract the main action item from the user's message."
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional additional details about the task."
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Optional due date. Can be natural language like 'tomorrow', 'Friday', 'next week', or a date."
                    }
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
                    "status_filter": {
                        "type": "string",
                        "enum": ["all", "pending", "done"],
                        "description": "Filter tasks by status. 'pending' for incomplete tasks, 'done' for completed, 'all' for everything."
                    }
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
                    "task_identifier": {
                        "type": "string",
                        "description": "Part of the task title to search for (e.g., 'groceries', 'report')."
                    }
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
                    "task_identifier": {
                        "type": "string",
                        "description": "Part of the task title to search for."
                    }
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
                    "task_identifier": {
                        "type": "string",
                        "description": "Part of the task title to find."
                    },
                    "new_title": {
                        "type": "string",
                        "description": "The new title for the task (optional)."
                    },
                    "new_description": {
                        "type": "string",
                        "description": "The new description for the task (optional)."
                    },
                    "new_due_date": {
                        "type": "string",
                        "description": "The new due date for the task (optional)."
                    }
                },
                "required": ["task_identifier"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "clear_completed_tasks",
            "description": "Delete all completed/done tasks at once. Use when user wants to clear, clean up, or remove all finished tasks.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "uncomplete_task",
            "description": "Mark a completed task as pending again. Use when user wants to undo completion or reopen a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {
                        "type": "string",
                        "description": "Part of the task title."
                    }
                },
                "required": ["task_identifier"]
            }
        }
    }
]

# =============================================================================
# System Prompt
# =============================================================================

SYSTEM_PROMPT = """You are a friendly and helpful task management assistant integrated with the user's todo app. You help users manage their tasks through natural conversation.

## Your Capabilities:
- Add new tasks (with optional description and due dates)
- List tasks (all, pending, or completed)
- Mark tasks as done
- Delete tasks
- Edit task details (title, description, due date)
- Clear all completed tasks
- Reopen completed tasks

## Guidelines:
1. **Be conversational and friendly** - Use natural language and encouraging messages
2. **Always use the provided tools** - When a user wants to manage tasks, call the appropriate function
3. **Handle ambiguity gracefully** - If unclear which task the user means, ask for clarification
4. **Confirm actions** - Always confirm what you did (e.g., "Added task: Buy groceries")
5. **Be helpful with suggestions** - If the user seems stuck, offer to show their tasks

## Response Format for Task Lists:
When listing tasks, format them clearly:
- Buy groceries (pending)
- Finish report - due Friday (pending)
- Call mom (done)

## Example Interactions:
- User: "add buy milk" -> Add task, respond: "Added: Buy milk"
- User: "show my tasks" -> List all tasks
- User: "done with groceries" -> Complete the task with "groceries" in title
- User: "delete shopping" -> Delete task with "shopping" in title

Remember: Changes you make appear in the user's todo app dashboard immediately!"""

# =============================================================================
# Tool Execution
# =============================================================================

# Tools that modify tasks (for tracking changes)
MODIFYING_TOOLS = {"add_task", "complete_task", "delete_task", "edit_task", "clear_completed_tasks", "uncomplete_task"}

async def execute_tool(tool_name: str, arguments: Dict, token: str) -> Dict[str, Any]:
    """Execute a tool function with the given arguments."""
    tool_functions = {
        "add_task": lambda args: add_task(token, **args),
        "list_tasks": lambda args: list_tasks(token, **args),
        "complete_task": lambda args: complete_task(token, **args),
        "delete_task": lambda args: delete_task(token, **args),
        "edit_task": lambda args: edit_task(token, **args),
        "clear_completed_tasks": lambda args: clear_completed_tasks(token),
        "uncomplete_task": lambda args: uncomplete_task(token, **args),
    }

    if tool_name in tool_functions:
        return await tool_functions[tool_name](arguments)
    else:
        return {"success": False, "message": f"Unknown tool: {tool_name}"}

# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title="Task Management Chatbot API",
    description="AI-powered chatbot integrated with todo app for natural language task management",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if "*" not in ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
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
    task_changed: bool  # True if tasks were modified

# In-memory conversation storage
conversations: Dict[str, List[Dict[str, Any]]] = {}
conversation_counter = 0

@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    print(f"[OK] Chatbot API started")
    print(f"[OK] Main backend URL: {MAIN_BACKEND_URL}")
    print(f"[OK] Environment: {ENVIRONMENT}")
    print(f"[OK] CORS Origins: {ALLOWED_ORIGINS}")

@app.get("/")
def read_root():
    """Root endpoint for health check."""
    return {
        "message": "Task Management Chatbot API is running",
        "status": "ok",
        "version": "3.0.0",
        "integration": "main-backend"
    }

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "main_backend": MAIN_BACKEND_URL
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, authorization: str = Header(None)):
    """Process a chat message and return AI response with task operations."""
    global conversation_counter

    # Extract token from Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = authorization.replace("Bearer ", "")

    try:
        # Get or create conversation
        conv_key = f"conv_{request.conversation_id}" if request.conversation_id else None

        if conv_key and conv_key in conversations:
            messages = conversations[conv_key]
        else:
            conversation_counter += 1
            conv_id = request.conversation_id or conversation_counter
            conv_key = f"conv_{conv_id}"
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
            # Add assistant's tool call message to history
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

            # Execute each tool call
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Execute the tool
                result = await execute_tool(function_name, arguments, token)

                # Check if tasks were modified
                if function_name in MODIFYING_TOOLS and result.get("success", False):
                    task_changed = True

                tool_calls_made.append(ToolCallResponse(
                    name=function_name,
                    arguments=arguments,
                    result=result
                ))

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result)
                })

            # Get final response from model after tool execution
            final_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=1000
            )
            final_content = final_response.choices[0].message.content or "Done!"
        else:
            final_content = assistant_message.content or "I'm here to help with your tasks!"

        # Store assistant response
        messages.append({"role": "assistant", "content": final_content})

        # Keep conversation history manageable
        if len(messages) > 21:
            messages = [messages[0]] + messages[-20:]
            conversations[conv_key] = messages

        # Extract conversation ID
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

# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
