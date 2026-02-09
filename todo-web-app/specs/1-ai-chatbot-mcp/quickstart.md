# Quickstart Guide: AI Chatbot with MCP Tools

**Feature**: AI Chatbot with MCP Tools
**Branch**: 1-ai-chatbot-mcp
**Created**: 2026-01-23

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL or Neon account
- OpenAI API key
- MCP server (can be local)

## Setup Instructions

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Fill in required environment variables
# - DATABASE_URL: Your PostgreSQL/Neon connection string
# - OPENAI_API_KEY: Your OpenAI API key
# - MCP_SERVER_URL: URL for MCP server
# - BETTER_AUTH_SECRET: Your auth secret
# - CHATKIT_DOMAIN_KEY: ChatKit domain key
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start MCP server
python -m src.mcp.server

# Start main backend
uvicorn src.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend
npm run dev
```

## API Endpoints
- `POST /api/{user_id}/chat` - Main chat endpoint

## Testing
```bash
# Run backend tests
pytest tests/

# Run frontend tests
npm run test
```

## Local Development
1. Start MCP server first
2. Start backend API
3. Start frontend
4. Access the chat interface at http://localhost:3000/chat