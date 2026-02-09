"""
Rate limiting implementation to prevent API abuse.
"""

from functools import wraps
from datetime import datetime, timedelta
from typing import Dict, Optional
import time
import threading
from fastapi import HTTPException, status

# Simple in-memory rate limiter (for development; production should use Redis)
class InMemoryRateLimiter:
    def __init__(self):
        self.requests = {}  # user_id -> list of request timestamps
        self.lock = threading.Lock()

    def is_allowed(self, user_id: str, max_requests: int, window_seconds: int) -> bool:
        """
        Check if a request is allowed based on rate limits.

        Args:
            user_id: The ID of the user making the request
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds

        Returns:
            True if request is allowed, False otherwise
        """
        with self.lock:
            now = datetime.now()
            window_start = now - timedelta(seconds=window_seconds)

            # Get existing requests for this user
            user_requests = self.requests.get(user_id, [])

            # Filter requests within the time window
            valid_requests = [req_time for req_time in user_requests if req_time > window_start]

            # Check if we're at the limit
            if len(valid_requests) >= max_requests:
                return False

            # Add current request
            valid_requests.append(now)
            self.requests[user_id] = valid_requests

            return True

# Initialize rate limiter
rate_limiter = InMemoryRateLimiter()


def rate_limit(max_requests: int = 100, window_seconds: int = 3600):
    """
    Rate limiting decorator for API endpoints.

    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get user_id from request - this is a simplification
            # In a real implementation, you'd extract user_id from the request object
            user_id = kwargs.get('user_id') or getattr(kwargs.get('request'), 'user_id', 'anonymous')

            if not rate_limiter.is_allowed(user_id, max_requests, window_seconds):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds} seconds."
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


class RateLimiter:
    """
    Rate limiter utility class.
    """

    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def check_rate_limit(self, user_id: str) -> bool:
        """
        Check if the user has exceeded the rate limit.

        Args:
            user_id: The ID of the user

        Returns:
            True if within limit, False if exceeded
        """
        return rate_limiter.is_allowed(user_id, self.max_requests, self.window_seconds)