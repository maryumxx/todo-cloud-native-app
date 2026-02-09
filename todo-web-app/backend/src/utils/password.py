"""
Password hashing utilities using bcrypt directly.

Using bcrypt directly instead of passlib due to compatibility issues
with Python 3.14 and newer bcrypt versions.
"""
import bcrypt
import logging

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hash to verify against

    Returns:
        True if password matches, False otherwise

    Raises:
        ValueError: If hashed_password is not a valid bcrypt hash
    """
    if not plain_password or not hashed_password:
        logger.warning("Empty password or hash provided for verification")
        return False

    # Apply same 72-byte truncation as get_password_hash for consistency
    password_bytes = plain_password.encode('utf-8')[:72]

    try:
        hash_bytes = hashed_password.encode('utf-8')
        result = bcrypt.checkpw(password_bytes, hash_bytes)
        logger.debug(f"Password verification result: {result}")
        return result
    except ValueError as e:
        # Invalid hash format - this indicates a data integrity issue
        logger.error(f"Invalid bcrypt hash format: {e}")
        raise ValueError(f"Invalid password hash format: {e}")
    except Exception as e:
        # Log unexpected errors with full details
        logger.error(f"Unexpected password verification error: {type(e).__name__}: {e}")
        raise


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        The bcrypt hash as a string

    Note:
        bcrypt has a 72-byte limit for passwords. Longer passwords
        are automatically truncated to ensure compatibility.
    """
    # Truncate to 72 bytes (bcrypt limitation)
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def validate_password_strength(password: str) -> bool:
    """
    Validate password strength based on minimum requirements.

    Requirements:
        - At least 8 characters

    Args:
        password: The password to validate

    Returns:
        True if password meets requirements, False otherwise
    """
    if len(password) < 8:
        return False
    return True