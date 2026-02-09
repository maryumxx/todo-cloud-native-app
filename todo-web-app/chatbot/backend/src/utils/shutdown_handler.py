"""
Shutdown procedures for database connections and other cleanup tasks.
"""

import asyncio
import atexit
import logging
from typing import Callable, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import Session
from .logger import app_logger


class ShutdownHandler:
    """
    Handler for application shutdown procedures.
    """

    def __init__(self):
        self.cleanup_functions = []
        self.logger = app_logger

    def add_cleanup(self, func: Callable, *args, **kwargs):
        """
        Add a cleanup function to be called on shutdown.

        Args:
            func: Function to call during cleanup
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
        """
        self.cleanup_functions.append((func, args, kwargs))

    async def run_cleanup(self):
        """
        Run all registered cleanup functions.
        """
        self.logger.info("Starting shutdown procedures...")

        for func, args, kwargs in self.cleanup_functions:
            try:
                if asyncio.iscoroutinefunction(func):
                    await func(*args, **kwargs)
                else:
                    func(*args, **kwargs)
            except Exception as e:
                self.logger.error(f"Error during cleanup: {str(e)}")

        self.logger.info("Shutdown procedures completed.")

    def register_exit_handler(self):
        """
        Register the cleanup function with Python's atexit module.
        """
        def cleanup_wrapper():
            # Since atexit doesn't support async functions, we run the cleanup synchronously
            # In a real application, you might want to handle this differently
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(self.run_cleanup())
                loop.close()
            except Exception as e:
                self.logger.error(f"Error in exit handler: {str(e)}")

        atexit.register(cleanup_wrapper)


# Global shutdown handler instance
shutdown_handler = ShutdownHandler()


def register_shutdown_handler(app: FastAPI):
    """
    Register shutdown handler with the FastAPI application lifecycle.

    Args:
        app: FastAPI application instance
    """
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup procedures can go here if needed
        yield
        # Shutdown procedures
        await shutdown_handler.run_cleanup()

    app.router.lifespan_context = lifespan


def close_database_connection(session: Session):
    """
    Close a database session.

    Args:
        session: SQLModel session to close
    """
    try:
        session.close()
        app_logger.info("Database session closed successfully")
    except Exception as e:
        app_logger.error(f"Error closing database session: {str(e)}")


def cleanup_resources():
    """
    Perform general resource cleanup.
    """
    app_logger.info("Performing general resource cleanup")
    # Add any other cleanup tasks here
    # For example: closing file handles, clearing caches, etc.