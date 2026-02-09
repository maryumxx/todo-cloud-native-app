# AI Chatbot

AI-powered chatbot for task management integration with the Todo Web App.

## Structure

```
chatbot/
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── agents/       # AI chat agents
│   │   ├── api/          # API routes
│   │   ├── database/     # Database connection
│   │   ├── mcp/          # MCP server integration
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── main.py       # FastAPI app entry
│   ├── alembic/          # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # React components
│   │   ├── lib/          # API client
│   │   └── styles/       # Global styles
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml    # Docker orchestration
└── render.yaml           # Render deployment config
```

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up
```

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for chat

### Frontend
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (default: http://localhost:8000)

## Integration with Todo Web App

The ChatInterface component can be imported into the main Todo Web App:

```tsx
import ChatInterface from '@/chatbot/frontend/src/components/chatkit/ChatInterface';

// Use in your component
<ChatInterface userId={currentUser.id} />
```
