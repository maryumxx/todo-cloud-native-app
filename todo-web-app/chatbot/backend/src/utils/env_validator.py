"""
Environment variable validation and configuration.
"""

import os
from typing import Dict, List, Optional
from pydantic import BaseSettings, validator
from .logger import app_logger


class EnvironmentValidator:
    """
    Validates environment variables and provides configuration.
    """

    @staticmethod
    def validate_required_vars(required_vars: List[str]) -> Dict[str, str]:
        """
        Validate that required environment variables are set.

        Args:
            required_vars: List of required environment variable names

        Returns:
            Dictionary of variable names and their values

        Raises:
            ValueError if any required variable is missing
        """
        missing_vars = []
        vars_dict = {}

        for var in required_vars:
            value = os.getenv(var)
            if not value:
                missing_vars.append(var)
            else:
                vars_dict[var] = value

        if missing_vars:
            error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
            app_logger.error(error_msg, {"missing_vars": missing_vars})
            raise ValueError(error_msg)

        app_logger.info("All required environment variables are present", {"variables": list(vars_dict.keys())})
        return vars_dict

    @staticmethod
    def validate_database_url(database_url: str) -> bool:
        """
        Validate the database URL format.

        Args:
            database_url: Database connection string

        Returns:
            True if valid, False otherwise
        """
        if not database_url:
            return False

        # Check for basic database URL patterns
        valid_patterns = [
            "postgresql://",
            "mysql://",
            "sqlite://",
            "oracle://",
            "mssql://"
        ]

        return any(database_url.startswith(pattern) for pattern in valid_patterns)

    @staticmethod
    def validate_openai_api_key(api_key: str) -> bool:
        """
        Validate the OpenAI API key format.

        Args:
            api_key: OpenAI API key

        Returns:
            True if valid, False otherwise
        """
        if not api_key:
            return False

        # OpenAI API keys typically start with "sk-" and have a certain length
        return api_key.startswith("sk-") and len(api_key) >= 30

    @staticmethod
    def validate_jwt_secret(secret: str) -> bool:
        """
        Validate JWT secret key strength.

        Args:
            secret: JWT secret key

        Returns:
            True if strong enough, False otherwise
        """
        if not secret:
            return False

        # Should be at least 32 characters for security
        return len(secret) >= 32

    @staticmethod
    def get_config_with_defaults() -> Dict[str, str]:
        """
        Get configuration with defaults for optional variables.

        Returns:
            Dictionary of configuration values
        """
        config = {
            # Required variables
            "DATABASE_URL": os.getenv("DATABASE_URL"),
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY"),

            # Optional variables with defaults
            "ENVIRONMENT": os.getenv("ENVIRONMENT", "development"),
            "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
            "PORT": os.getenv("PORT", "8000"),
            "HOST": os.getenv("HOST", "0.0.0.0"),
            "ACCESS_TOKEN_EXPIRE_MINUTES": os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"),
            "MAX_CHAT_HISTORY_LENGTH": os.getenv("MAX_CHAT_HISTORY_LENGTH", "50"),
        }

        # Validate required variables
        required_vars = ["DATABASE_URL", "OPENAI_API_KEY", "JWT_SECRET_KEY"]
        EnvironmentValidator.validate_required_vars(required_vars)

        # Validate specific formats
        if not EnvironmentValidator.validate_database_url(config["DATABASE_URL"]):
            raise ValueError("Invalid DATABASE_URL format")

        if not EnvironmentValidator.validate_openai_api_key(config["OPENAI_API_KEY"]):
            raise ValueError("Invalid OPENAI_API_KEY format")

        if not EnvironmentValidator.validate_jwt_secret(config["JWT_SECRET_KEY"]):
            raise ValueError("JWT_SECRET_KEY should be at least 32 characters for security")

        app_logger.info("Configuration validated successfully", {"environment": config["ENVIRONMENT"]})
        return config

    @staticmethod
    def validate_all_config() -> bool:
        """
        Validate all configuration settings.

        Returns:
            True if all validations pass, False otherwise
        """
        try:
            config = EnvironmentValidator.get_config_with_defaults()

            # Additional validations can be added here
            port = int(config.get("PORT", "8000"))
            if not (1 <= port <= 65535):
                raise ValueError(f"Invalid PORT: {port}. Port must be between 1 and 65535.")

            app_logger.info("All configuration validations passed")
            return True
        except Exception as e:
            app_logger.error(f"Configuration validation failed: {str(e)}")
            return False


# Singleton instance
env_validator = EnvironmentValidator()