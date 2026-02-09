"""
Conversation Service layer for database operations related to conversations.
"""
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from datetime import datetime
from ..models.conversation import Conversation


class ConversationService:
    """
    Service class for handling conversation-related database operations.
    """

    def __init__(self, session: Session):
        self.session = session

    def create_conversation(self, user_id: UUID) -> Conversation:
        """
        Create a new conversation for the user.

        Args:
            user_id: The ID of the user creating the conversation

        Returns:
            The created Conversation object
        """
        conversation = Conversation(
            user_id=user_id
        )
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation

    def get_conversation_by_id(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Get a conversation by its ID.

        Args:
            conversation_id: The ID of the conversation to retrieve

        Returns:
            The Conversation object if found, None otherwise
        """
        statement = select(Conversation).where(Conversation.id == conversation_id)
        return self.session.exec(statement).first()

    def get_conversations_by_user_id(self, user_id: UUID) -> List[Conversation]:
        """
        Get all conversations for a user.

        Args:
            user_id: The ID of the user

        Returns:
            List of Conversation objects
        """
        statement = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.created_at.desc())
        return self.session.exec(statement).all()

    def update_conversation(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Update a conversation's updated_at timestamp.

        Args:
            conversation_id: The ID of the conversation to update

        Returns:
            The updated Conversation object if successful, None otherwise
        """
        conversation = self.get_conversation_by_id(conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self.session.add(conversation)
            self.session.commit()
            self.session.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation_id: UUID) -> bool:
        """
        Delete a conversation.

        Args:
            conversation_id: The ID of the conversation to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        conversation = self.get_conversation_by_id(conversation_id)
        if conversation:
            self.session.delete(conversation)
            self.session.commit()
            return True
        return False