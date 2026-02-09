"""
Backwards compatibility module - use src.db.connection instead.
"""
from .db.connection import engine, get_session, create_db_and_tables

__all__ = ["engine", "get_session", "create_db_and_tables"]
