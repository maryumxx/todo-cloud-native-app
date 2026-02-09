# Tasks: Todo Web Application - Phase 2 Authentication Rebuild

**Input**: Design documents from `/specs/002-todo-web-app/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested - tests are NOT included in this task list. Add them if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Focus**: Phase 2 Authentication Rebuild - backend FastAPI with Passlib/bcrypt and JWT

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `todo-web-app/backend/src/`
- **Frontend**: `todo-web-app/frontend/src/`
- **Migrations**: `todo-web-app/backend/alembic/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per plan.md in todo-web-app/backend/
- [x] T002 [P] Create requirements.txt with dependencies (fastapi, uvicorn, sqlalchemy, alembic, passlib[bcrypt], python-jose, pydantic, python-dotenv) in todo-web-app/backend/requirements.txt
- [x] T003 [P] Create .env.example with DATABASE_URL, JWT_SECRET, JWT_EXPIRE_MINUTES in todo-web-app/backend/.env.example
- [x] T004 [P] Create frontend project structure with Next.js App Router in todo-web-app/frontend/
- [x] T005 [P] Create frontend package.json with dependencies (next, react, tailwindcss, @dnd-kit/core, date-fns) in todo-web-app/frontend/package.json
- [x] T006 [P] Configure Tailwind CSS with dark mode support in todo-web-app/frontend/tailwind.config.js

**Checkpoint**: Project structure ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create config.py with Settings class using pydantic-settings for DATABASE_URL, JWT_SECRET, JWT_EXPIRE_MINUTES in todo-web-app/backend/src/config.py
- [x] T008 [P] Create database.py with SQLAlchemy engine, sessionmaker, Base, get_db dependency in todo-web-app/backend/src/database.py
- [x] T009 [P] Create password utility with hash_password() and verify_password() using Passlib CryptContext bcrypt in todo-web-app/backend/src/utils/password.py
- [x] T010 [P] Create JWT utility with create_access_token() using python-jose HS256 in todo-web-app/backend/src/utils/jwt.py
- [x] T011 Create User model with id (Integer PK), email (unique, indexed), hashed_password, created_at using SQLAlchemy in todo-web-app/backend/src/models/user.py
- [x] T012 Initialize Alembic with alembic init and configure env.py for SQLAlchemy in todo-web-app/backend/alembic/
- [x] T013 Create initial Alembic migration for users table in todo-web-app/backend/alembic/versions/
- [x] T014 Create main.py FastAPI app with CORS middleware allowing localhost:3000 in todo-web-app/backend/src/main.py
- [x] T015 [P] Create frontend API client with fetch wrapper and retry logic (3 attempts) in todo-web-app/frontend/src/services/api.ts
- [x] T016 [P] Create auth token utility (setToken, getToken, removeToken) using localStorage in todo-web-app/frontend/src/lib/auth.ts

**Checkpoint**: Foundation ready - user story implementation can now begin ✅

---

## Phase 3: User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Users can register with email/password and login to receive JWT token

**Independent Test**: Register a new user, login, verify token works with /me endpoint

**Acceptance Criteria** (from spec.md):
1. Register with valid email/password → 201 + token
2. Login with correct credentials → 200 + token
3. Access /me with valid token → 200 + user info

### Implementation for User Story 1

- [x] T017 [P] [US1] Create Pydantic schemas UserCreate (email, password with min 8 chars) in todo-web-app/backend/src/schemas/auth.py
- [x] T018 [P] [US1] Create Pydantic schemas UserLogin (email, password) in todo-web-app/backend/src/schemas/auth.py
- [x] T019 [P] [US1] Create Pydantic schemas UserResponse (id, email) and TokenResponse (access_token, token_type) in todo-web-app/backend/src/schemas/auth.py
- [x] T020 [US1] Create AuthService with register() method: validate email, hash password, create user, return token in todo-web-app/backend/src/services/auth_service.py
- [x] T021 [US1] Add AuthService login() method: find user by email, verify password, return token in todo-web-app/backend/src/services/auth_service.py
- [x] T022 [US1] Add AuthService get_user_by_id() method for token validation in todo-web-app/backend/src/services/auth_service.py
- [x] T023 [US1] Create verify_token() function and get_current_user FastAPI dependency in todo-web-app/backend/src/utils/jwt.py
- [x] T024 [US1] Create auth router with POST /api/auth/register (201 success, 400 validation, 409 duplicate) in todo-web-app/backend/src/api/auth.py
- [x] T025 [US1] Add POST /api/auth/login endpoint (200 success, 401 invalid credentials) in todo-web-app/backend/src/api/auth.py
- [x] T026 [US1] Add GET /api/auth/me endpoint (200 with user, 401 unauthorized) in todo-web-app/backend/src/api/auth.py
- [x] T027 [US1] Register auth router in main.py with prefix /api/auth in todo-web-app/backend/src/main.py
- [x] T028 [P] [US1] Create registration page with email/password form in todo-web-app/frontend/src/app/(auth)/register/page.tsx
- [x] T029 [P] [US1] Create login page with email/password form in todo-web-app/frontend/src/app/(auth)/login/page.tsx
- [x] T030 [US1] Implement registration form submission: call API, store token, redirect to dashboard in todo-web-app/frontend/src/app/(auth)/register/page.tsx
- [x] T031 [US1] Implement login form submission: call API, store token, redirect to dashboard in todo-web-app/frontend/src/app/(auth)/login/page.tsx
- [x] T032 [US1] Create AuthContext provider with user state, login(), logout(), isAuthenticated in todo-web-app/frontend/src/contexts/AuthContext.tsx
- [x] T033 [US1] Create auth layout wrapping login/register pages in todo-web-app/frontend/src/app/(auth)/layout.tsx

**Checkpoint**: User Story 1 complete - users can register, login, and get current user info ✅

---

## Phase 4: User Story 2 - Task Management (Priority: P1)

**Goal**: Authenticated users can create, view, update, and delete their tasks

**Independent Test**: Create task, view task list, toggle completion, delete task

**Acceptance Criteria** (from spec.md):
1. Create new task → appears in list
2. Toggle task complete → status persists
3. Delete task → removed from list
4. Update task → changes saved

### Implementation for User Story 2

- [x] T034 [P] [US2] Create Task model with id (UUID PK), title, description, is_completed, due_date, position, user_id (FK), timestamps in todo-web-app/backend/src/models/task.py
- [x] T035 [P] [US2] Create Pydantic schemas TaskCreate (title required, description optional, due_date optional) in todo-web-app/backend/src/schemas/task.py
- [x] T036 [P] [US2] Create Pydantic schemas TaskUpdate (all optional), TaskResponse, TaskListResponse in todo-web-app/backend/src/schemas/task.py
- [x] T037 [US2] Create Alembic migration for tasks table with foreign key to users in todo-web-app/backend/alembic/versions/
- [x] T038 [US2] Create TaskService with create_task() filtering by user_id in todo-web-app/backend/src/services/task_service.py
- [x] T039 [US2] Add TaskService list_tasks() with pagination and user_id filter in todo-web-app/backend/src/services/task_service.py
- [x] T040 [US2] Add TaskService get_task() with user_id ownership check returning 404 if not found/not owned in todo-web-app/backend/src/services/task_service.py
- [x] T041 [US2] Add TaskService update_task() with ownership validation in todo-web-app/backend/src/services/task_service.py
- [x] T042 [US2] Add TaskService delete_task() with ownership validation in todo-web-app/backend/src/services/task_service.py
- [x] T043 [US2] Create tasks router with GET /api/tasks (list paginated) requiring auth in todo-web-app/backend/src/api/tasks.py
- [x] T044 [US2] Add POST /api/tasks endpoint for task creation in todo-web-app/backend/src/api/tasks.py
- [x] T045 [US2] Add GET /api/tasks/{task_id} endpoint in todo-web-app/backend/src/api/tasks.py
- [x] T046 [US2] Add PUT /api/tasks/{task_id} endpoint for updates in todo-web-app/backend/src/api/tasks.py
- [x] T047 [US2] Add DELETE /api/tasks/{task_id} endpoint in todo-web-app/backend/src/api/tasks.py
- [x] T048 [US2] Add POST /api/tasks/reorder endpoint for drag-drop ordering in todo-web-app/backend/src/api/tasks.py
- [x] T049 [US2] Register tasks router in main.py with prefix /api/tasks in todo-web-app/backend/src/main.py
- [x] T050 [P] [US2] Create TaskList component fetching and displaying tasks in todo-web-app/frontend/src/components/TaskList.tsx
- [x] T051 [P] [US2] Create TaskItem component with checkbox, title, actions (edit/delete) in todo-web-app/frontend/src/components/TaskItem.tsx
- [x] T052 [P] [US2] Create TaskForm component for create/edit with title/description fields in todo-web-app/frontend/src/components/TaskForm.tsx
- [x] T053 [US2] Create dashboard page integrating TaskList and TaskForm in todo-web-app/frontend/src/app/dashboard/page.tsx
- [x] T054 [US2] Create useTasks hook with CRUD operations and state management in todo-web-app/frontend/src/hooks/useTasks.ts
- [x] T055 [US2] Implement drag-and-drop reordering with @dnd-kit in TaskList component in todo-web-app/frontend/src/components/TaskList.tsx

**Checkpoint**: User Story 2 complete - full task CRUD operations working ✅

---

## Phase 5: User Story 3 - Secure Session Management (Priority: P2)

**Goal**: Users maintain sessions across browser sessions and can logout securely

**Independent Test**: Login, close browser, reopen, verify session, logout

**Acceptance Criteria** (from spec.md):
1. Session persists on browser refresh (within token expiry)
2. Logout clears session and redirects to login
3. Expired token prompts re-authentication

### Implementation for User Story 3

- [x] T056 [US3] Add POST /api/auth/logout endpoint (clears any server-side session data if applicable) in todo-web-app/backend/src/api/auth.py
- [x] T057 [US3] Create Next.js middleware for protected routes checking auth token in todo-web-app/frontend/src/middleware.ts
- [x] T058 [US3] Add logout functionality to AuthContext clearing token and redirecting in todo-web-app/frontend/src/contexts/AuthContext.tsx
- [x] T059 [US3] Create ProtectedRoute wrapper component checking authentication in todo-web-app/frontend/src/components/ProtectedRoute.tsx
- [x] T060 [US3] Add automatic redirect on 401 responses in API client in todo-web-app/frontend/src/services/api.ts
- [x] T061 [US3] Create Header component with user email and logout button in todo-web-app/frontend/src/components/Header.tsx

**Checkpoint**: User Story 3 complete - secure session management working ✅

---

## Phase 6: User Story 4 - Multi-User Isolation (Priority: P1)

**Goal**: Each user only sees their own tasks, data is isolated

**Independent Test**: Two users login, each only sees own tasks, cannot access others' data

**Acceptance Criteria** (from spec.md):
1. User A's tasks not visible to User B
2. API returns 404 for other user's task IDs (not 403 to avoid revealing existence)
3. User ID from JWT used for all queries

### Implementation for User Story 4

- [x] T062 [US4] Verify TaskService list_tasks() filters by user_id from JWT in todo-web-app/backend/src/services/task_service.py
- [x] T063 [US4] Verify get/update/delete task return 404 (not 403) when task not owned by user in todo-web-app/backend/src/services/task_service.py
- [x] T064 [US4] Add user_id extraction from JWT to all task endpoints ensuring isolation in todo-web-app/backend/src/api/tasks.py

**Checkpoint**: User Story 4 complete - multi-user isolation verified ✅

---

## Phase 7: User Profile & Preferences (Priority: P2)

**Goal**: Users can view and update their profile settings

**Independent Test**: View profile, update display name, change theme preference

### Implementation

- [x] T065 [P] Update User model adding display_name, avatar_url, bio, theme_preference, onboarding_completed columns in todo-web-app/backend/src/models/user.py
- [x] T066 [P] Create Pydantic schemas UserProfileUpdate (display_name, avatar_url, bio, theme_preference) in todo-web-app/backend/src/schemas/user.py
- [x] T067 [P] Create Pydantic schema UserProfileResponse extending UserResponse with profile fields in todo-web-app/backend/src/schemas/user.py
- [x] T068 Create Alembic migration adding profile columns to users table in todo-web-app/backend/alembic/versions/
- [x] T069 Create UserService with get_profile() returning full user profile in todo-web-app/backend/src/services/user_service.py
- [x] T070 Add UserService update_profile() method in todo-web-app/backend/src/services/user_service.py
- [x] T071 Add UserService complete_onboarding() setting flag to true in todo-web-app/backend/src/services/user_service.py
- [x] T072 Create users router with GET /api/users/profile in todo-web-app/backend/src/api/users.py
- [x] T073 Add PUT /api/users/profile endpoint in todo-web-app/backend/src/api/users.py
- [x] T074 Add POST /api/users/onboarding endpoint in todo-web-app/backend/src/api/users.py
- [x] T075 Register users router in main.py with prefix /api/users in todo-web-app/backend/src/main.py
- [x] T076 [P] Create profile page displaying user info in todo-web-app/frontend/src/app/profile/page.tsx
- [x] T077 [P] Create ProfileForm component with editable fields in todo-web-app/frontend/src/components/ProfileForm.tsx
- [x] T078 Create ThemeContext managing system/light/dark theme state in todo-web-app/frontend/src/contexts/ThemeContext.tsx
- [x] T079 Apply user theme preference on app load from profile API in todo-web-app/frontend/src/app/layout.tsx

**Checkpoint**: User profile and theme preferences working ✅

---

## Phase 8: Calendar & Events (Priority: P2)

**Goal**: Users can manage calendar events and view tasks by due date

**Independent Test**: Create event, view on calendar, set task due date, view tasks on calendar

### Implementation

- [x] T080 [P] Create Event model with id (UUID), title, description, start_time, end_time, user_id (FK), timestamps in todo-web-app/backend/src/models/event.py
- [x] T081 [P] Create Pydantic schemas EventCreate (title, start_time, end_time required), EventUpdate, EventResponse in todo-web-app/backend/src/schemas/event.py
- [x] T082 Create Alembic migration for events table with foreign key to users in todo-web-app/backend/alembic/versions/
- [x] T083 Create EventService with CRUD operations filtering by user_id in todo-web-app/backend/src/services/event_service.py
- [x] T084 Create events router with GET /api/events (list with date range filter) in todo-web-app/backend/src/api/events.py
- [x] T085 Add POST, GET/{id}, PUT/{id}, DELETE/{id} endpoints to events router in todo-web-app/backend/src/api/events.py
- [x] T086 Register events router in main.py with prefix /api/events in todo-web-app/backend/src/main.py
- [x] T087 [P] Create Calendar component with month grid using date-fns in todo-web-app/frontend/src/components/Calendar.tsx
- [x] T088 [P] Create CalendarDay component showing events and tasks for that date in todo-web-app/frontend/src/components/CalendarDay.tsx
- [x] T089 [P] Create EventForm modal component for create/edit events in todo-web-app/frontend/src/components/EventForm.tsx
- [x] T090 Create calendar page with month navigation in todo-web-app/frontend/src/app/calendar/page.tsx
- [x] T091 Create useEvents hook for event CRUD operations in todo-web-app/frontend/src/hooks/useEvents.ts
- [x] T092 Integrate task due dates display on calendar showing tasks on their due dates in todo-web-app/frontend/src/components/Calendar.tsx

**Checkpoint**: Calendar and events feature complete ✅

---

## Phase 9: Onboarding & Polish (Priority: P3)

**Goal**: First-time users see onboarding wizard, UI is polished

### Implementation

- [x] T093 [P] Create onboarding wizard page with step state machine in todo-web-app/frontend/src/app/onboarding/page.tsx
- [x] T094 [P] Create WelcomeStep component explaining app features in todo-web-app/frontend/src/components/onboarding/WelcomeStep.tsx
- [x] T095 [P] Create CreateTaskStep component guiding first task creation in todo-web-app/frontend/src/components/onboarding/CreateTaskStep.tsx
- [x] T096 [P] Create CompleteStep component with theme selection and finish button in todo-web-app/frontend/src/components/onboarding/CompleteStep.tsx
- [x] T097 Check onboarding_completed on dashboard load, redirect to /onboarding if false in todo-web-app/frontend/src/app/dashboard/page.tsx
- [x] T098 [P] Create Navigation component with hamburger menu for mobile in todo-web-app/frontend/src/components/Navigation.tsx
- [x] T099 [P] Add prefers-reduced-motion CSS media query disabling animations in todo-web-app/frontend/src/styles/globals.css
- [x] T100 Create EmptyState component for task list when no tasks exist in todo-web-app/frontend/src/components/EmptyState.tsx
- [x] T101 Add loading spinner and error states throughout application in todo-web-app/frontend/src/components/
- [x] T102 [P] Create health check endpoint GET /health returning status and timestamp in todo-web-app/backend/src/main.py
- [ ] T103 Run quickstart.md validation testing all curl commands

**Checkpoint**: Onboarding complete, UI polished ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
Phase 3 (US1: Auth) ← Must complete first
    ↓
┌───────────────────────────────────────┐
│  Phase 4 (US2: Tasks) ← Needs auth    │
│  Phase 5 (US3: Sessions) ← Needs US1  │
│  Phase 6 (US4: Isolation) ← Needs US2 │
│  Phase 7 (Profile) ← Needs US1        │
│  Phase 8 (Calendar) ← Needs US1, US2  │
└───────────────────────────────────────┘
    ↓
Phase 9 (Polish) ← After core features
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US1 (Auth) | Foundation | None (must be first) |
| US2 (Tasks) | US1 | US3 (Sessions) |
| US3 (Sessions) | US1 | US2 (Tasks) |
| US4 (Isolation) | US2 | US3 |
| Profile | US1 | US2, US3, US4 |
| Calendar | US1, US2 | US3, Profile |

### Parallel Opportunities

**Phase 1 Setup** (all parallelizable):
```bash
T002, T003, T004, T005, T006
```

**Phase 2 Foundational** (parallel groups):
```bash
Group A: T008, T009, T010 (database and utilities - no deps)
Group B: T015, T016 (frontend utilities - no deps)
After Group A: T011 (User model needs database.py)
After T011: T012, T013 (migrations need model)
```

**Phase 3 US1** (parallel groups):
```bash
Schemas: T017, T018, T019 (all parallel)
After schemas: T020-T022 (AuthService sequentially)
T023 (JWT dependency)
Backend routes: T024-T027 (sequential)
Frontend: T028, T029 (parallel pages)
After frontend pages: T030-T033 (implementation)
```

**Phase 4 US2** (parallel groups):
```bash
Setup: T034, T035, T036 (model and schemas - parallel)
After setup: T037 (migration)
Service: T038-T042 (sequential service methods)
Routes: T043-T049 (sequential endpoints)
Frontend: T050, T051, T052 (components - parallel)
After components: T053-T055 (integration)
```

---

## Implementation Strategy

### MVP First (Phases 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Auth)
4. **STOP and VALIDATE**: Test auth with curl commands from quickstart.md
5. Deploy/demo if ready - users can register and login

### Incremental Delivery

| Milestone | Phases | Tasks | Value Delivered |
|-----------|--------|-------|-----------------|
| MVP Auth | 1-3 | T001-T033 | Register, login, get user |
| + Tasks | + 4, 6 | + T034-T064 | Full task CRUD with isolation |
| + Sessions | + 5 | + T056-T061 | Secure logout, token handling |
| + Profile | + 7 | + T065-T079 | User settings, theme |
| + Calendar | + 8 | + T080-T092 | Events, due dates |
| + Polish | + 9 | + T093-T103 | Onboarding, responsive UI |

### Validation Commands (from quickstart.md)

```bash
# After Phase 3 (US1):
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expect: 201 with {"access_token": "...", "token_type": "bearer"}

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expect: 200 with {"access_token": "...", "token_type": "bearer"}

curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token>"
# Expect: 200 with {"id": 1, "email": "test@example.com"}

# Test duplicate email (expect 409):
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expect: 409 with {"detail": "Email already registered"}

# Test wrong password (expect 401):
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
# Expect: 401 with {"detail": "Invalid email or password"}
```

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| **Total Tasks** | 103 | 102/103 ✅ |
| **Phase 1 Setup** | 6 | ✅ Complete |
| **Phase 2 Foundational** | 10 | ✅ Complete |
| **Phase 3 US1 Auth** | 17 | ✅ Complete |
| **Phase 4 US2 Tasks** | 22 | ✅ Complete |
| **Phase 5 US3 Sessions** | 6 | ✅ Complete |
| **Phase 6 US4 Isolation** | 3 | ✅ Complete |
| **Phase 7 Profile** | 15 | ✅ Complete |
| **Phase 8 Calendar** | 13 | ✅ Complete |
| **Phase 9 Polish** | 11 | 10/11 (T103 pending) |

**Parallelizable Tasks**: 42 (marked with [P])
**MVP Scope**: Phases 1-3 (33 tasks) → ✅ Working auth system
**Full Task CRUD**: Phases 1-4, 6 (64 tasks) → ✅ Complete task management
**Remaining**: T103 - Run quickstart.md validation testing all curl commands

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Phase 2 Auth uses Integer IDs per plan.md (simplified model for auth)
- Full User model with UUID and profile fields comes in Phase 7
- All API endpoints return `{"detail": "message"}` on errors per research.md
- JWT expiry is 60 minutes per plan.md
- Frontend uses localStorage for token storage per research.md
- Passwords hashed with bcrypt (cost factor default) via Passlib
- Email normalized to lowercase on registration and login
