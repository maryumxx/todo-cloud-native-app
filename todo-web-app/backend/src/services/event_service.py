from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from ..models.event import Event, EventCreate, EventUpdate, EventResponse
from ..models.user import User
from ..exceptions import EventNotFoundException, EventOwnershipException, UserNotFoundException


class EventService:
    """
    Service class for handling event-related operations.
    """

    def get_events_by_user(
        self,
        session: Session,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[EventResponse]:
        """
        Get all events for a specific user, optionally filtered by date range.

        Args:
            session: Database session
            user_id: User's UUID
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            List of EventResponse objects
        """
        statement = select(Event).where(Event.user_id == user_id)

        if start_date:
            statement = statement.where(Event.start_time >= start_date)
        if end_date:
            statement = statement.where(Event.end_time <= end_date)

        statement = statement.order_by(Event.start_time)
        events = session.exec(statement).all()

        return [EventResponse.model_validate(event) for event in events]

    def get_event_by_id(self, session: Session, event_id: UUID, user_id: UUID) -> EventResponse:
        """
        Get a specific event by ID for a user.

        Args:
            session: Database session
            event_id: Event's UUID
            user_id: User's UUID

        Returns:
            EventResponse object

        Raises:
            EventNotFoundException: If event doesn't exist
            EventOwnershipException: If event doesn't belong to the user
        """
        event = session.get(Event, event_id)

        if not event:
            raise EventNotFoundException()

        if event.user_id != user_id:
            raise EventOwnershipException()

        return EventResponse.model_validate(event)

    def create_event(self, session: Session, event_create: EventCreate, user_id: UUID) -> EventResponse:
        """
        Create a new event for a user.

        Args:
            session: Database session
            event_create: Event creation data
            user_id: User's UUID

        Returns:
            EventResponse object

        Raises:
            UserNotFoundException: If user doesn't exist
        """
        # Verify user exists
        user = session.get(User, user_id)
        if not user:
            raise UserNotFoundException()

        # Create new event
        db_event = Event(
            title=event_create.title,
            description=event_create.description,
            start_time=event_create.start_time,
            end_time=event_create.end_time,
            user_id=user_id
        )

        session.add(db_event)
        session.commit()
        session.refresh(db_event)

        return EventResponse.model_validate(db_event)

    def update_event(
        self,
        session: Session,
        event_id: UUID,
        event_update: EventUpdate,
        user_id: UUID
    ) -> EventResponse:
        """
        Update an event for a user.

        Args:
            session: Database session
            event_id: Event's UUID
            event_update: Event update data
            user_id: User's UUID

        Returns:
            EventResponse object

        Raises:
            EventNotFoundException: If event doesn't exist
            EventOwnershipException: If event doesn't belong to the user
        """
        db_event = session.get(Event, event_id)

        if not db_event:
            raise EventNotFoundException()

        if db_event.user_id != user_id:
            raise EventOwnershipException()

        # Update event attributes
        for attr, value in event_update.model_dump(exclude_unset=True).items():
            setattr(db_event, attr, value)

        db_event.updated_at = datetime.utcnow()

        session.add(db_event)
        session.commit()
        session.refresh(db_event)

        return EventResponse.model_validate(db_event)

    def delete_event(self, session: Session, event_id: UUID, user_id: UUID) -> bool:
        """
        Delete an event for a user.

        Args:
            session: Database session
            event_id: Event's UUID
            user_id: User's UUID

        Returns:
            True if event was deleted successfully

        Raises:
            EventNotFoundException: If event doesn't exist
            EventOwnershipException: If event doesn't belong to the user
        """
        db_event = session.get(Event, event_id)

        if not db_event:
            raise EventNotFoundException()

        if db_event.user_id != user_id:
            raise EventOwnershipException()

        session.delete(db_event)
        session.commit()

        return True
