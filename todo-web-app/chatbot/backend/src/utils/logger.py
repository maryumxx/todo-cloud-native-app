"""
Comprehensive logging for debugging and monitoring.
"""

import logging
import sys
from datetime import datetime
from typing import Any, Dict
import json
import os
from logging.handlers import RotatingFileHandler


class LoggerSetup:
    """
    Setup and configuration for application logging.
    """

    def __init__(self, name: str = __name__, log_level: str = "INFO"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))

        # Prevent duplicate handlers if logger already exists
        if not self.logger.handlers:
            self._setup_handlers()

    def _setup_handlers(self):
        """Setup console and file handlers."""
        # Console handler for development
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)

        # File handler for production
        log_dir = os.getenv("LOG_DIR", "logs")
        os.makedirs(log_dir, exist_ok=True)

        file_handler = RotatingFileHandler(
            filename=os.path.join(log_dir, "app.log"),
            maxBytes=10*1024*1024,  # 10 MB
            backupCount=5
        )
        file_handler.setLevel(logging.INFO)

        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
        )
        simple_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )

        # Add formatters to handlers
        console_handler.setFormatter(simple_formatter)
        file_handler.setFormatter(detailed_formatter)

        # Add handlers to logger
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)

    def get_logger(self):
        """Get the configured logger instance."""
        return self.logger


def create_log_entry(level: str, message: str, extra_data: Dict[str, Any] = None) -> str:
    """
    Create a structured log entry.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        message: Log message
        extra_data: Additional data to include in the log

    Returns:
        JSON string representation of the log entry
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        "extra_data": extra_data or {}
    }
    return json.dumps(log_entry)


class AppLogger:
    """
    Application logger with additional functionality.
    """

    def __init__(self, name: str = __name__):
        self.logger_setup = LoggerSetup(name)
        self.logger = self.logger_setup.get_logger()

    def debug(self, message: str, extra_data: Dict[str, Any] = None):
        """Log a debug message."""
        log_entry = create_log_entry("DEBUG", message, extra_data)
        self.logger.debug(log_entry)

    def info(self, message: str, extra_data: Dict[str, Any] = None):
        """Log an info message."""
        log_entry = create_log_entry("INFO", message, extra_data)
        self.logger.info(log_entry)

    def warning(self, message: str, extra_data: Dict[str, Any] = None):
        """Log a warning message."""
        log_entry = create_log_entry("WARNING", message, extra_data)
        self.logger.warning(log_entry)

    def error(self, message: str, extra_data: Dict[str, Any] = None):
        """Log an error message."""
        log_entry = create_log_entry("ERROR", message, extra_data)
        self.logger.error(log_entry)

    def critical(self, message: str, extra_data: Dict[str, Any] = None):
        """Log a critical message."""
        log_entry = create_log_entry("CRITICAL", message, extra_data)
        self.logger.critical(log_entry)

    def log_api_call(self, endpoint: str, method: str, user_id: str, status_code: int, response_time: float):
        """Log an API call with relevant details."""
        extra_data = {
            "endpoint": endpoint,
            "method": method,
            "user_id": user_id,
            "status_code": status_code,
            "response_time_ms": response_time
        }
        self.info(f"API call to {endpoint}", extra_data)

    def log_db_operation(self, operation: str, table: str, user_id: str, success: bool, duration: float):
        """Log a database operation."""
        extra_data = {
            "operation": operation,
            "table": table,
            "user_id": user_id,
            "success": success,
            "duration_ms": duration
        }
        status = "successful" if success else "failed"
        self.info(f"Database {operation} on {table} {status}", extra_data)

    def log_security_event(self, event_type: str, user_id: str, ip_address: str, details: str = ""):
        """Log a security-related event."""
        extra_data = {
            "event_type": event_type,
            "user_id": user_id,
            "ip_address": ip_address,
            "details": details
        }
        self.warning(f"Security event: {event_type}", extra_data)


# Global logger instance
app_logger = AppLogger()