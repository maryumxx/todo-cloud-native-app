"""
FastAPI application entry point.

Todo Web Application API with JWT authentication.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio

from .api.auth import router as auth_router
from .api.tasks import router as tasks_router
from .api.events import router as events_router
from .api.users import router as users_router
from .api.ready import router as ready_router
from .db.connection import create_db_and_tables
from .websocket.manager import ConnectionManager

# Import chat router with graceful fallback (in case openai not installed)
try:
    from .api.chat import router as chat_router
    CHAT_ENABLED = True
except ImportError as e:
    print(f"[WARNING] Chat module not available: {e}")
    chat_router = None
    CHAT_ENABLED = False

# Initialize WebSocket manager
manager = ConnectionManager()

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    """
    app = FastAPI(
        title="Todo Web Application API",
        description="RESTful API for the Todo Web Application with JWT authentication",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS for frontend (per research.md)
    app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        
        "https://taskflowtodo.vercel.app",  # <-- YOUR REAL VERCEL URL
        "https://*.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:30007",  # For NodePort access
        "http://127.0.0.1:30007",  # Alternative NodePort access
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "WS", "WEBSOCKET"],
    allow_headers=["*"],   # THIS is critical for Authorization header
)

    # Include API routers
    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(tasks_router, prefix="/api/tasks", tags=["Tasks"])
    app.include_router(events_router, prefix="/api/events", tags=["Events"])
    app.include_router(users_router, prefix="/api/users", tags=["Users"])
    app.include_router(ready_router, prefix="", tags=["System"])

    # Include chat router only if available
    if CHAT_ENABLED and chat_router:
        app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])

    # WebSocket endpoint for real-time task synchronization
    @app.websocket("/api/tasks/ws/{user_id}")
    async def websocket_endpoint(websocket: WebSocket, user_id: str):
        await manager.connect(websocket, user_id)
        try:
            while True:
                # Keep the connection alive
                data = await websocket.receive_text()
                # Optionally handle incoming messages from client
                # For now, just acknowledge receipt
                await manager.send_personal_message({
                    "type": "ack",
                    "message": "Message received",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)

    # Broadcast function to send updates to all connected clients for a user
    @app.post("/api/tasks/broadcast/{user_id}")
    async def broadcast_update(user_id: str, message: dict):
        await manager.broadcast_to_user(message, user_id)
        return {"message": "Update broadcasted to user", "user_id": user_id}

    # Create database tables on startup
    @app.on_event("startup")
    def on_startup():
        create_db_and_tables()

    # Root endpoint
    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "Todo Web Application API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health"
        }

    # Health check endpoint (per api-spec.yaml)
    @app.get("/health", tags=["System"])
    def health_check():
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    from .config import settings
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
