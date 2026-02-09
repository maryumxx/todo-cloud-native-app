"""
Security utilities for JWT token handling and user isolation.
"""

import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from ..models.user import User
from ..database.connection import SessionLocal
from sqlmodel import select
from .logger import app_logger


# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get JWT settings from environment
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-default-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


class SecurityUtils:
    """
    Security utilities for authentication, authorization, and user isolation.
    """

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain password against its hash.

        Args:
            plain_password: Plain text password
            hashed_password: Hashed password to verify against

        Returns:
            True if passwords match, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Generate a hash for the given password.

        Args:
            password: Plain text password

        Returns:
            Hashed password
        """
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a new access token with the given data.

        Args:
            data: Data to encode in the token
            expires_delta: Expiration time delta (optional)

        Returns:
            Encoded JWT token
        """
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire, "iat": datetime.utcnow()})

        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify the JWT token and return the payload.

        Args:
            token: JWT token to verify

        Returns:
            Payload dictionary if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                app_logger.log_security_event("invalid_token", "unknown", "", "Token missing user ID")
                return None

            # Additional checks could go here (e.g., token blacklisting)
            return payload
        except JWTError as e:
            app_logger.log_security_event("token_verification_failed", "unknown", "", str(e))
            return None

    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.

        Args:
            email: User's email address
            password: User's password

        Returns:
            User object if authentication successful, None otherwise
        """
        with SessionLocal() as session:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()

            if not user or not SecurityUtils.verify_password(password, user.hashed_password):
                app_logger.log_security_event("failed_login", "unknown", "", f"Failed login attempt for {email}")
                return None

            app_logger.log_security_event("successful_login", str(user.id), "", f"Successful login for {email}")
            return user

    @staticmethod
    def verify_user_ownership(resource_user_id: str, current_user_id: str) -> bool:
        """
        Verify that the current user owns the specified resource.

        Args:
            resource_user_id: ID of the user who owns the resource
            current_user_id: ID of the currently authenticated user

        Returns:
            True if the user owns the resource, False otherwise
        """
        result = resource_user_id == current_user_id

        if not result:
            app_logger.log_security_event(
                "unauthorized_access_attempt",
                current_user_id,
                "",
                f"Attempted access to resource belonging to user {resource_user_id}"
            )

        return result

    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """
        Generate a cryptographically secure random token.

        Args:
            length: Length of the token in bytes (default 32)

        Returns:
            Random token as hex string
        """
        return secrets.token_hex(length)

    @staticmethod
    def hash_sensitive_data(data: str) -> str:
        """
        Hash sensitive data for storage.

        Args:
            data: Sensitive data to hash

        Returns:
            SHA-256 hash of the data
        """
        return hashlib.sha256(data.encode()).hexdigest()

    @staticmethod
    def validate_jwt_token_structure(token: str) -> bool:
        """
        Validate the basic structure of a JWT token (without verifying signature).

        Args:
            token: JWT token to validate

        Returns:
            True if structure is valid, False otherwise
        """
        try:
            # Split the token by periods
            parts = token.split('.')
            if len(parts) != 3:
                return False

            # Check that each part is base64-url encoded
            for part in parts:
                # Add padding if necessary
                padded_part = part + '=' * (4 - len(part) % 4) if len(part) % 4 != 0 else part
                # Decode to check if it's valid base64-url
                import base64
                base64.urlsafe_b64decode(padded_part)

            return True
        except Exception:
            return False

    @staticmethod
    def sanitize_user_input_for_db(user_input: str) -> str:
        """
        Sanitize user input to prevent SQL injection and other attacks.

        Args:
            user_input: Raw user input

        Returns:
            Sanitized input safe for database queries
        """
        # Remove potentially dangerous SQL keywords
        dangerous_keywords = [
            'drop', 'delete', 'truncate', 'insert', 'update', 'create', 'alter', 'exec',
            'union', 'select', 'from', 'where', '--', ';', 'xp_', 'sp_'
        ]

        sanitized = user_input.lower()
        for keyword in dangerous_keywords:
            # Replace the keyword with a harmless string
            sanitized = sanitized.replace(keyword, f'<{keyword}_filtered>')

        return sanitized


# Create a global security instance
security_utils = SecurityUtils()