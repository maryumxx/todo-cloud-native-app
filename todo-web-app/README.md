# Todo Web App

A full-stack web application for managing todo tasks with authentication.

## Features

- User registration and authentication
- Task CRUD operations
- Secure JWT-based authentication
- Responsive web interface
- Multi-user isolation

## Backend

Built with FastAPI and PostgreSQL using SQLModel.

### Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Frontend

Built with Next.js.

### Setup

```bash
cd frontend
npm install
npm run dev
```

## Architecture

- Backend: FastAPI with authentication, task management API
- Frontend: Next.js with authentication flow and task management UI
- Database: PostgreSQL with SQLAlchemy/SQLModel ORM