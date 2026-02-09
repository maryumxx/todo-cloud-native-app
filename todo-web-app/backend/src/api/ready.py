"""
Readiness probe endpoint for Kubernetes.
"""
from fastapi import APIRouter, Response
from datetime import datetime
from ..db.connection import engine
import sqlalchemy

router = APIRouter()

@router.get("/ready")
async def readiness_check(response: Response):
    """Readiness probe - checks if the application is ready to serve traffic."""
    try:
        # Test database connectivity
        with engine.connect() as conn:
            # Simple query to test connection
            result = conn.execute(sqlalchemy.text("SELECT 1"))
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "connected"
            }
        }
    except Exception as e:
        response.status_code = 503
        return {
            "status": "not_ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": f"error: {str(e)}"
            }
        }