from sqlmodel import SQLModel
from typing import Any


class Base(SQLModel):
    """
    Base class for all models in the application.
    """
    pass


def create_db_and_tables(engine):
    """
    Create database tables for all models.
    """
    SQLModel.metadata.create_all(bind=engine)