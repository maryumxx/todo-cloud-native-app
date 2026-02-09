"""
Main FastAPI application for the AI Chatbot system.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.chat import router as chat_router
from .database.connection import create_db_and_tables

# Create the FastAPI app
app = FastAPI(
    title="AI Chatbot API",
    description="API for the AI Chatbot with MCP Tools",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(chat_router)

@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    create_db_and_tables()

@app.get("/")
def read_root():
    """Root endpoint for health check."""
    return {"message": "AI Chatbot API is running", "status": "ok"}

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": __import__('datetime').datetime.utcnow().isoformat()}