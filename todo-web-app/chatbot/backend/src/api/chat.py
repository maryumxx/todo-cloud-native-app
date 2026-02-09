"""
Chat API endpoint for the AI chatbot.
Implements the POST /api/{user_id}/chat endpoint per FR-007.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID
from ..middleware.auth import get_current_user
from ..database.connection import get_session
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..agents.chat_agent import chat_agent
from ..services.conversation_service import ConversationService
from ..services.message_service import MessageService
from ..models.message import MessageRole
from datetime import datetime

router = APIRouter(prefix="/api", tags=["chat"])

# Request and Response models
class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str


class ToolCall(BaseModel):
    name: str
    arguments: dict


class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: list[ToolCall]


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    db: Session = Depends(get_session)
):
    """
    Process a chat message from a user and return the AI agent's response.

    This implements the POST /api/{user_id}/chat endpoint per FR-007.
    It follows the stateless architecture by fetching conversation history
    from the database for each request before processing.
    """
    try:
        # Validate user_id format
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        # Initialize services
        conversation_service = ConversationService(db)
        message_service = MessageService(db)

        # Get or create conversation
        conversation_id = request.conversation_id
        if conversation_id:
            # Check if conversation exists and belongs to user
            conversation = conversation_service.get_conversation_by_id(UUID(int(conversation_id)))
            if not conversation or str(conversation.user_id) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or does not belong to user"
                )
        else:
            # Create new conversation
            conversation = conversation_service.create_conversation(user_uuid)
            conversation_id = int(conversation.id)

        # Store the user's message
        user_message = message_service.create_message(
            conversation_id=UUID(int(conversation_id)),
            user_id=user_uuid,
            role=MessageRole.USER,
            content=request.message
        )

        # Fetch conversation history per FR-006 (fetch history from DB for each request)
        conversation_history = message_service.get_messages_by_conversation_id(UUID(int(conversation_id)))

        # Format messages for the agent (convert to dict format)
        formatted_history = [
            {
                "role": msg.role.value,
                "content": msg.content
            }
            for msg in conversation_history[:-1]  # Exclude the current message we just added
        ]

        # Process the message with the AI agent
        agent_result = chat_agent.process_message(
            user_message=request.message,
            user_id=user_id,
            conversation_history=formatted_history
        )

        # Store the agent's response
        if agent_result.get("response"):
            assistant_message = message_service.create_message(
                conversation_id=UUID(int(conversation_id)),
                user_id=user_uuid,  # The AI acts on behalf of the system/user
                role=MessageRole.ASSISTANT,
                content=agent_result["response"]
            )

        # Format the response per FR-008 (return conversation_id, response, and tool_calls)
        response = ChatResponse(
            conversation_id=conversation_id,
            response=agent_result.get("response", ""),
            tool_calls=[
                ToolCall(name=call["name"], arguments=call["arguments"])
                for call in agent_result.get("tool_calls", [])
            ]
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error and return a generic error response per FR-010
        print(f"Error in chat endpoint: {e}")  # In production, use proper logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )