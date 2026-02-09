"""
Application configuration loaded from environment variables.

Per research.md:
- JWT expiry: 24 hours
- Shared secret: minimum 256-bit
- Algorithm: HS256
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database - uses SQLite by default for development, PostgreSQL in production
    database_url: str = "sqlite:///./todo.db"

    # JWT Configuration (per research.md)
    jwt_secret_key: str = "your-256-bit-secret-key-minimum-32-characters-long"
    jwt_algorithm: str = "HS256"
    algorithm: str = "HS256"  # Alias for backwards compatibility
    access_token_expire_minutes: int = 1440  # 24 hours

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False


settings = Settings()
