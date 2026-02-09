"""
Database connection module for Neon PostgreSQL.

Per research.md:
- Connection pooling: 5-20 connections
- Idle timeout: 300 seconds
- Statement timeout: 30 seconds
"""
from sqlmodel import SQLModel, Session, create_engine
from ..config import settings

# Create engine - different settings for SQLite vs PostgreSQL
if "sqlite" in settings.database_url:
    # SQLite configuration
    engine = create_engine(
        settings.database_url,
        echo=settings.debug,
        connect_args={"check_same_thread": False}  # Required for SQLite with FastAPI
    )
else:
    # PostgreSQL configuration with connection pooling
    engine = create_engine(
        settings.database_url,
        pool_size=5,
        max_overflow=15,  # Up to 20 total connections
        pool_recycle=300,  # Recycle connections after 5 minutes (idle timeout)
        pool_pre_ping=True,  # Verify connections before use
        echo=settings.debug,  # Log SQL queries in debug mode
        # connect_args={
        #     "connect_timeout": 30,
        #     "options": "-c statement_timeout=30000"  # 30 second statement timeout
        # }
    )


def get_session():
    """
    Get a database session.

    Yields:
        Session: A SQLModel database session
    """
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """
    Create all database tables.

    This imports all models to ensure they're registered with SQLModel
    before creating tables.
    """
    # Import models to register them
    from ..models import User, Task, Event  # noqa: F401

    SQLModel.metadata.create_all(bind=engine)
