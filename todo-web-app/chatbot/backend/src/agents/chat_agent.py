"""
AI Agent for chatbot functionality using OpenAI Agents SDK
This module configures the AI agent to recognize task management intents
and route them to appropriate MCP tools.
"""
import openai
from openai import OpenAI
from typing import Dict, Any, List
import json
import os
from dotenv import load_dotenv
from ..mcp.server import mcp_server

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatAgent:
    """
    AI Agent that processes user requests and determines appropriate actions.
    It recognizes user intent and routes to appropriate MCP tools.
    """

    def __init__(self):
        self.system_prompt = """
        You are a helpful task management assistant. You can help users with:

        1. Creating tasks - when users want to add something, use add_task
        2. Listing tasks - when users ask to see their tasks, use list_tasks
        3. Completing tasks - when users mark tasks as done, use complete_task
        4. Deleting tasks - when users want to remove tasks, use delete_task
        5. Updating tasks - when users want to change task details, use update_task

        Always confirm actions with users before executing them.
        Be friendly but concise in your responses.
        If a request is ambiguous, ask for clarification.
        """
        self.tools = self._define_tools()

    def _define_tools(self) -> List[Dict[str, Any]]:
        """
        Define the tools available to the agent based on MCP server tools.
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
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
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "Returns tasks for the user based on filter",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user whose tasks to retrieve"},
                            "status_filter": {"type": "string", "description": "Optional filter ('all', 'pending', 'completed')"}
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Marks a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "string", "description": "The ID of the task to complete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Deletes a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "string", "description": "The ID of the task to delete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
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
        ]

    def process_message(self, user_message: str, user_id: str, conversation_history: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Process a user message and return the agent's response and any tool calls.

        Args:
            user_message: The message from the user
            user_id: The ID of the user
            conversation_history: History of the conversation

        Returns:
            Dictionary containing response and tool calls
        """
        # Prepare messages for the OpenAI API
        messages = [{"role": "system", "content": self.system_prompt}]

        # Add conversation history
        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Add the current user message
        messages.append({"role": "user", "content": user_message})

        try:
            # Call OpenAI API with tools
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",  # Could be configurable
                messages=messages,
                tools=self.tools,
                tool_choice="auto"  # Let the model decide when to use tools
            )

            # Extract the response
            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls

            # Process tool calls if any
            tool_results = []
            if tool_calls:
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    # Add user_id to function arguments if not present
                    if "user_id" not in function_args:
                        function_args["user_id"] = user_id

                    # Execute the tool
                    result = mcp_server.execute_tool(function_name, **function_args)
                    tool_results.append({
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": json.dumps(result)
                    })

                # If there were tool calls, get a final response from the model
                if tool_results:
                    # Add the assistant's tool calls to the messages
                    messages.append(response_message)
                    for tool_result in tool_results:
                        messages.append({
                            "role": "tool",
                            "content": tool_result["content"],
                            "tool_call_id": tool_result["tool_call_id"]
                        })

                    # Get the final response after tool execution
                    final_response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=messages
                    )
                    final_content = final_response.choices[0].message.content
                else:
                    final_content = response_message.content
            else:
                # No tool calls, just return the content
                final_content = response_message.content

            return {
                "response": final_content or "I processed your request.",
                "tool_calls": [
                    {
                        "name": tc.function.name,
                        "arguments": json.loads(tc.function.arguments),
                        "result": next(tr for tr in tool_results if tr["tool_call_id"] == tc.id)["content"]
                    }
                    for tc in (tool_calls or [])
                ]
            }

        except Exception as e:
            return {
                "response": f"I encountered an error processing your request: {str(e)}",
                "tool_calls": [],
                "error": str(e)
            }

# Global agent instance
chat_agent = ChatAgent()