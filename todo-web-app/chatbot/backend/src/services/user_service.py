"""
User Service layer for database operations related to users.
"""
from typing import Optional
from uuid import UUID
from sqlmodel import Session, select
from ..models.user import User


class UserService:
    """
    Service class for handling user-related database operations.
    """

    def __init__(self, session: Session):
        self.session = session

    def create_user(self, email: str) -> User:
        """
        Create a new user.

        Args:
            email: The email address of the user

        Returns:
            The created User object
        """
        user = User(email=email)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Get a user by their ID.

        Args:
            user_id: The ID of the user to retrieve

        Returns:
            The User object if found, None otherwise
        """
        statement = select(User).where(User.id == user_id)
        return self.session.exec(statement).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get a user by their email address.

        Args:
            email: The email address of the user

        Returns:
            The User object if found, None otherwise
        """
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()

    def update_user(self, user_id: UUID, email: str) -> Optional[User]:
        """
        Update a user's email address.

        Args:
            user_id: The ID of the user to update
            email: The new email address

        Returns:
            The updated User object if successful, None otherwise
        """
        user = self.get_user_by_id(user_id)
        if user:
            user.email = email
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
        return user

    def delete_user(self, user_id: UUID) -> bool:
        """
        Delete a user.

        Args:
            user_id: The ID of the user to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        user = self.get_user_by_id(user_id)
        if user:
            self.session.delete(user)
            self.session.commit()
            return True
        return False