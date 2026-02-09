"""
Input validation utilities to prevent injection attacks and ensure data integrity.
"""

import re
from typing import Any, Optional
from pydantic import BaseModel, validator
from fastapi import HTTPException, status
import html


class InputValidator:
    """
    Utility class for input validation to prevent injection attacks.
    """

    @staticmethod
    def sanitize_input(input_str: str) -> str:
        """
        Sanitize input string to prevent XSS and injection attacks.

        Args:
            input_str: The input string to sanitize

        Returns:
            Sanitized string
        """
        if not input_str:
            return input_str

        # Remove HTML tags and escape HTML entities
        sanitized = html.escape(input_str)

        # Remove potentially dangerous characters
        # Only allow alphanumeric characters, spaces, and common punctuation
        sanitized = re.sub(r'[<>"\'&]', '', sanitized)

        return sanitized.strip()

    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate email format.

        Args:
            email: Email address to validate

        Returns:
            True if valid, False otherwise
        """
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_uuid(uuid_str: str) -> bool:
        """
        Validate UUID format.

        Args:
            uuid_str: UUID string to validate

        Returns:
            True if valid, False otherwise
        """
        pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return bool(re.match(pattern, uuid_str))

    @staticmethod
    def validate_task_title(title: str) -> tuple[bool, str]:
        """
        Validate task title.

        Args:
            title: Task title to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not title or len(title.strip()) == 0:
            return False, "Task title cannot be empty"

        if len(title) > 255:
            return False, "Task title must be 255 characters or less"

        # Check for potentially harmful patterns
        if re.search(r'[<>"\']', title):
            return False, "Task title contains invalid characters"

        return True, ""

    @staticmethod
    def validate_task_description(description: str) -> tuple[bool, str]:
        """
        Validate task description.

        Args:
            description: Task description to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if description is None:
            return True, ""  # Description is optional

        if len(description) > 1000:
            return False, "Task description must be 1000 characters or less"

        # Check for potentially harmful patterns
        if re.search(r'[<>"\']', description):
            return False, "Task description contains invalid characters"

        return True, ""

    @staticmethod
    def validate_user_input(user_input: str) -> tuple[bool, str]:
        """
        Validate general user input.

        Args:
            user_input: User input to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not user_input or len(user_input.strip()) == 0:
            return False, "Input cannot be empty"

        if len(user_input) > 10000:  # Arbitrary limit for chat messages
            return False, "Input is too long"

        # Check for potentially harmful patterns
        if re.search(r'<script|javascript:|vbscript:|onload|onerror', user_input, re.IGNORECASE):
            return False, "Input contains potentially harmful content"

        return True, ""

    @staticmethod
    def validate_conversation_id(conv_id: Optional[str]) -> tuple[bool, str]:
        """
        Validate conversation ID if provided.

        Args:
            conv_id: Conversation ID to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if conv_id is None:
            return True, ""

        try:
            int(conv_id)  # Check if it's a valid integer
            return True, ""
        except ValueError:
            return False, "Invalid conversation ID format"


def validate_and_sanitize_input(input_value: str, field_name: str) -> str:
    """
    Convenience function to validate and sanitize an input.

    Args:
        input_value: Value to validate and sanitize
        field_name: Name of the field (for error messages)

    Returns:
        Sanitized input value

    Raises:
        HTTPException if validation fails
    """
    if not input_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} cannot be empty"
        )

    # Validate the input
    is_valid, error_msg = InputValidator.validate_user_input(input_value)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}: {error_msg}"
        )

    # Sanitize the input
    sanitized = InputValidator.sanitize_input(input_value)
    return sanitized


class TaskInputValidator(BaseModel):
    """
    Pydantic model for validating task inputs.
    """
    title: str
    description: Optional[str] = None

    @validator('title')
    def validate_title(cls, v):
        is_valid, error_msg = InputValidator.validate_task_title(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @validator('description')
    def validate_description(cls, v):
        if v is not None:
            is_valid, error_msg = InputValidator.validate_task_description(v)
            if not is_valid:
                raise ValueError(error_msg)
        return v