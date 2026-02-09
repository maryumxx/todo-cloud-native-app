from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from ..database import get_session
from ..api.deps import get_current_user_id
from ..models.event import EventCreate, EventUpdate, EventResponse
from ..services.event_service import EventService


router = APIRouter(tags=["Events"])


@router.get("/", response_model=List[EventResponse])
def get_events(
    start_date: Optional[datetime] = Query(None, description="Filter events starting from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter events ending before this date"),
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get all events for the current user, optionally filtered by date range.
    """
    event_service = EventService()
    return event_service.get_events_by_user(session, current_user_id, start_date, end_date)


@router.post("/", response_model=EventResponse)
def create_event(
    event_create: EventCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Create a new event for the current user.
    """
    event_service = EventService()
    return event_service.create_event(session, event_create, current_user_id)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get a specific event by ID for the current user.
    """
    event_service = EventService()
    return event_service.get_event_by_id(session, event_id, current_user_id)


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: UUID,
    event_update: EventUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Update an event for the current user.
    """
    event_service = EventService()
    return event_service.update_event(session, event_id, event_update, current_user_id)


@router.delete("/{event_id}")
def delete_event(
    event_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Delete an event for the current user.
    """
    event_service = EventService()
    success = event_service.delete_event(session, event_id, current_user_id)
    if success:
        return {"message": "Event deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )
