from sqlmodel import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")

# For PostgreSQL with psycopg2, we need to ensure the right driver is used
if DATABASE_URL.startswith("postgresql://"):
    # Replace asyncpg driver with psycopg2 if present
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session() -> Generator:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def create_db_and_tables():
    from sqlmodel import SQLModel
    from ..models.user import User
    from ..models.task import Task
    from ..models.conversation import Conversation
    from ..models.message import Message

    SQLModel.metadata.create_all(bind=engine)