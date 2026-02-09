from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from ..database import get_session
from ..api.deps import get_current_user_id
from ..models.user import UserResponse, UserProfileUpdate
from ..services.user_service import UserService


router = APIRouter(tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get the current user's profile.
    """
    user_service = UserService()
    return user_service.get_user_profile(session, current_user_id)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_update: UserProfileUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Update the current user's profile.
    """
    user_service = UserService()
    return user_service.update_user_profile(session, current_user_id, profile_update)


@router.post("/onboarding", response_model=UserResponse)
def complete_onboarding(
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Mark the current user's onboarding as completed.
    """
    user_service = UserService()
    return user_service.complete_onboarding(session, current_user_id)
