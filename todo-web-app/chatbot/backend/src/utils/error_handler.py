"""
Comprehensive error handling for database, API, and AI service failures.
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Callable
from functools import wraps
import logging
import traceback
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for the application.
    """
    logger.error(f"Unhandled exception: {exc}\nTraceback: {traceback.format_exc()}")

    # Log the error with more context
    error_id = f"ERR_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{hash(str(exc)) % 10000:04d}"
    logger.error(f"Error ID: {error_id} | Path: {request.url.path} | Method: {request.method}")

    # Return appropriate error response based on the type of exception
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "error_id": error_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    # For other exceptions, return a generic 500 error
    return JSONResponse(
        status_code=500,
        content={
            "error": "An internal server error occurred",
            "error_id": error_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def handle_database_errors(func: Callable):
    """
    Decorator to handle database-related errors gracefully.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            # Log the full traceback for debugging
            logger.error(traceback.format_exc())

            # Raise HTTP exception for API to handle appropriately
            raise HTTPException(
                status_code=500,
                detail=f"Database operation failed: {str(e)}"
            )

    return wrapper


def handle_ai_service_errors(func: Callable):
    """
    Decorator to handle AI service (OpenAI API) related errors gracefully.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"AI service error in {func.__name__}: {str(e)}")
            # Log the full traceback for debugging
            logger.error(traceback.format_exc())

            # Return a user-friendly error message
            raise HTTPException(
                status_code=503,
                detail="AI service temporarily unavailable. Please try again later."
            )

    return wrapper


class ErrorHandler:
    """
    Centralized error handler for the application.
    """

    @staticmethod
    def log_error(error: Exception, context: str = ""):
        """
        Log an error with context.
        """
        logger.error(f"Error in {context}: {str(error)}")
        logger.error(f"Traceback: {traceback.format_exc()}")

    @staticmethod
    def create_error_response(error_msg: str, status_code: int = 500):
        """
        Create a standardized error response.
        """
        error_id = f"ERR_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{hash(error_msg) % 10000:04d}"

        return {
            "error": error_msg,
            "error_id": error_id,
            "timestamp": datetime.utcnow().isoformat(),
            "status": status_code
        }