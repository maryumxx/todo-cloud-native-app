# Quickstart Guide: Todo Web Application

**Feature**: 002-todo-web-app | **Date**: 2026-01-21 (Updated for Phase 2 Auth Rebuild)

---

## Phase 2 Authentication - Quick Test

### Backend Auth Only Setup (Phase 2)

```bash
cd todo-web-app/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Phase 2 auth dependencies
pip install fastapi uvicorn sqlalchemy alembic "passlib[bcrypt]" python-jose pydantic

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./auth.db
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_EXPIRE_MINUTES=60
EOF

# Start server
uvicorn src.main:app --reload --port 8000
```

### Test Phase 2 Auth Endpoints

```bash
# 1. Register (expect 201)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 2. Login (expect 200)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 3. Get current user (use token from step 2)
TOKEN="<access_token_from_login>"
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Test duplicate email (expect 409)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 5. Test wrong password (expect 401)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
```

### Expected Phase 2 Responses

**Registration Success (201):**
```json
{"access_token": "eyJ...", "token_type": "bearer"}
```

**Login Success (200):**
```json
{"access_token": "eyJ...", "token_type": "bearer"}
```

**Get Me Success (200):**
```json
{"id": 1, "email": "test@example.com"}
```

**Duplicate Email (409):**
```json
{"detail": "Email already registered"}
```

**Invalid Credentials (401):**
```json
{"detail": "Invalid email or password"}
```

---

## Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.11+ (Python 3.14 supported with `from __future__ import annotations`)
- PostgreSQL (Neon Serverless PostgreSQL recommended)
- Git

## Quick Setup

### 1. Clone Repository

```bash
git clone [repository-url]
cd todo-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# Or using uv:
uv pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# Or using pnpm:
pnpm install
```

### 4. Environment Configuration

**Backend `.env`** (create in `backend/` directory):

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET_KEY=your-256-bit-secret-key-minimum-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

**Frontend `.env.local`** (create in `frontend/` directory):

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Better Auth
BETTER_AUTH_SECRET=your-better-auth-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### 5. Database Setup

```bash
cd backend

# Run migrations
alembic upgrade head

# Or create tables directly (development only)
python -c "from src.db.connection import create_db_and_tables; create_db_and_tables()"
```

### 6. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 7. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

---

## Test Scenarios

### User Story 1: Registration and Login (P1)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Register new user | POST `/api/auth/register` with valid email/password | 201 Created, returns JWT |
| Register duplicate email | POST `/api/auth/register` with existing email | 400 Bad Request |
| Register weak password | POST `/api/auth/register` with < 8 char password | 400 Bad Request |
| Login success | POST `/api/auth/login` with valid credentials | 200 OK, returns JWT |
| Login invalid password | POST `/api/auth/login` with wrong password | 401 Unauthorized |
| Login non-existent user | POST `/api/auth/login` with unknown email | 401 Unauthorized |

**Manual Test:**

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### User Story 2: Task Management (P1)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Create task | POST `/api/tasks` with title | 201 Created |
| Create task with due date | POST `/api/tasks` with title + due_date | 201 Created |
| List tasks | GET `/api/tasks` | 200 OK, paginated list |
| Get single task | GET `/api/tasks/{id}` | 200 OK |
| Update task | PUT `/api/tasks/{id}` with changes | 200 OK |
| Toggle completion | PUT `/api/tasks/{id}` with is_completed | 200 OK |
| Delete task | DELETE `/api/tasks/{id}` | 204 No Content |
| Reorder tasks | POST `/api/tasks/reorder` with task_ids | 200 OK |

**Manual Test:**

```bash
# Set token from login response
TOKEN="your-jwt-token"

# Create task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task", "description": "Task description"}'

# List tasks
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### User Story 3: Session Management (P2)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Access with valid JWT | GET `/api/auth/me` with valid token | 200 OK |
| Access with expired JWT | GET `/api/auth/me` with expired token | 401 Unauthorized |
| Access with invalid JWT | GET `/api/auth/me` with tampered token | 401 Unauthorized |
| Logout | POST `/api/auth/logout` | 200 OK |

### User Story 4: Multi-User Isolation (P1)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| User A creates task | POST `/api/tasks` as User A | Task created for User A |
| User B lists tasks | GET `/api/tasks` as User B | User A's task NOT visible |
| User B accesses User A's task | GET `/api/tasks/{userA-task-id}` as User B | 404 Not Found |

---

## API Quick Reference

### Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/auth/logout` | POST | Yes | Logout user |
| `/api/auth/me` | GET | Yes | Get current user |

### Tasks

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/tasks` | GET | Yes | List tasks (paginated) |
| `/api/tasks` | POST | Yes | Create task |
| `/api/tasks/{id}` | GET | Yes | Get single task |
| `/api/tasks/{id}` | PUT | Yes | Update task |
| `/api/tasks/{id}` | DELETE | Yes | Delete task |
| `/api/tasks/reorder` | POST | Yes | Reorder tasks |

### Events

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/events` | GET | Yes | List events |
| `/api/events` | POST | Yes | Create event |
| `/api/events/{id}` | GET | Yes | Get single event |
| `/api/events/{id}` | PUT | Yes | Update event |
| `/api/events/{id}` | DELETE | Yes | Delete event |

### Users

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/profile` | GET | Yes | Get user profile |
| `/api/users/profile` | PUT | Yes | Update profile |
| `/api/users/onboarding` | POST | Yes | Complete onboarding |

---

## Common Issues

### Backend won't start

1. Check Python version: `python --version` (need 3.11+)
2. Verify DATABASE_URL is correct
3. Check if port 8000 is available
4. Ensure virtual environment is activated

### Frontend won't start

1. Check Node version: `node --version` (need 18+)
2. Delete `node_modules` and reinstall
3. Check if port 3000 is available
4. Verify `.env.local` exists

### Database connection fails

1. Verify DATABASE_URL format
2. Check Neon project is active
3. Ensure SSL mode is enabled for Neon
4. Check firewall/network settings

### JWT errors

1. Ensure JWT_SECRET_KEY matches between frontend and backend
2. Check token expiration settings
3. Verify Authorization header format: `Bearer <token>`

---

## Development Commands

```bash
# Backend
cd backend
uvicorn src.main:app --reload          # Start with hot reload
pytest                                   # Run tests
alembic revision --autogenerate -m ""   # Create migration
alembic upgrade head                     # Apply migrations

# Frontend
cd frontend
npm run dev                              # Start dev server
npm run build                            # Production build
npm run lint                             # Run linter
npm run test                             # Run tests
```
