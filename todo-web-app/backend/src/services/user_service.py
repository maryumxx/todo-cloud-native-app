from sqlmodel import Session
from uuid import UUID
from datetime import datetime
from ..models.user import User, UserResponse, UserProfileUpdate
from ..exceptions import UserNotFoundException


class UserService:
    """
    Service class for handling user profile operations.
    """

    def get_user_profile(self, session: Session, user_id: UUID) -> UserResponse:
        """
        Get user profile by ID.

        Args:
            session: Database session
            user_id: User's UUID

        Returns:
            UserResponse object

        Raises:
            UserNotFoundException: If user doesn't exist
        """
        user = session.get(User, user_id)

        if not user:
            raise UserNotFoundException()

        return UserResponse.model_validate(user)

    def update_user_profile(
        self,
        session: Session,
        user_id: UUID,
        profile_update: UserProfileUpdate
    ) -> UserResponse:
        """
        Update user profile.

        Args:
            session: Database session
            user_id: User's UUID
            profile_update: Profile update data

        Returns:
            UserResponse object

        Raises:
            UserNotFoundException: If user doesn't exist
        """
        user = session.get(User, user_id)

        if not user:
            raise UserNotFoundException()

        # Update profile attributes
        for attr, value in profile_update.model_dump(exclude_unset=True).items():
            setattr(user, attr, value)

        user.updated_at = datetime.utcnow()

        session.add(user)
        session.commit()
        session.refresh(user)

        return UserResponse.model_validate(user)

    def complete_onboarding(self, session: Session, user_id: UUID) -> UserResponse:
        """
        Mark user's onboarding as completed.

        Args:
            session: Database session
            user_id: User's UUID

        Returns:
            UserResponse object

        Raises:
            UserNotFoundException: If user doesn't exist
        """
        user = session.get(User, user_id)

        if not user:
            raise UserNotFoundException()

        user.onboarding_completed = True
        user.updated_at = datetime.utcnow()

        session.add(user)
        session.commit()
        session.refresh(user)

        return UserResponse.model_validate(user)
