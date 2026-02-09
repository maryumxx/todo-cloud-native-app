from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from enum import Enum

if TYPE_CHECKING:
    from .user import User
    from .conversation import Conversation


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    __tablename__: str = "messages"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", nullable=False)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    role: MessageRole = Field(nullable=False)
    content: str = Field(nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="messages")
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role}, created_at={self.created_at})>"