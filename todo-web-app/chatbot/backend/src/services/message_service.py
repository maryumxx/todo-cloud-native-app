"""
Message Service layer for database operations related to messages.
"""
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from ..models.message import Message, MessageRole


class MessageService:
    """
    Service class for handling message-related database operations.
    """

    def __init__(self, session: Session):
        self.session = session

    def create_message(self, conversation_id: UUID, user_id: UUID, role: MessageRole, content: str) -> Message:
        """
        Create a new message in a conversation.

        Args:
            conversation_id: The ID of the conversation
            user_id: The ID of the user who sent the message
            role: The role of the sender ('user' or 'assistant')
            content: The content of the message

        Returns:
            The created Message object
        """
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return message

    def get_message_by_id(self, message_id: UUID) -> Optional[Message]:
        """
        Get a message by its ID.

        Args:
            message_id: The ID of the message to retrieve

        Returns:
            The Message object if found, None otherwise
        """
        statement = select(Message).where(Message.id == message_id)
        return self.session.exec(statement).first()

    def get_messages_by_conversation_id(self, conversation_id: UUID) -> List[Message]:
        """
        Get all messages for a conversation, ordered by creation time.

        Args:
            conversation_id: The ID of the conversation

        Returns:
            List of Message objects
        """
        statement = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
        return self.session.exec(statement).all()

    def get_messages_by_user_id(self, user_id: UUID) -> List[Message]:
        """
        Get all messages sent by a user.

        Args:
            user_id: The ID of the user

        Returns:
            List of Message objects
        """
        statement = select(Message).where(Message.user_id == user_id).order_by(Message.created_at.desc())
        return self.session.exec(statement).all()

    def delete_message(self, message_id: UUID) -> bool:
        """
        Delete a message.

        Args:
            message_id: The ID of the message to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        message = self.get_message_by_id(message_id)
        if message:
            self.session.delete(message)
            self.session.commit()
            return True
        return False