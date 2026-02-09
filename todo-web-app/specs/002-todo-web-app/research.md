# Research Document: Todo Web Application

**Feature**: 002-todo-web-app | **Date**: 2026-01-21 (Updated for Phase 2 Auth Rebuild)

## Research Summary

This document consolidates all technology decisions, best practices, and architectural patterns for the Todo Web Application Phase II implementation.

---

## 1. Authentication Strategy (Phase 2 Rebuild)

### Decision: FastAPI + Passlib/bcrypt + python-jose JWT

**Rationale**: Phase 2 requires a complete authentication rebuild from scratch using FastAPI backend with Passlib for password hashing and python-jose for JWT. This replaces Better Auth with a custom backend-only authentication flow.

**Alternatives Considered**:
- Better Auth: Being replaced per Phase 2 requirements
- Session cookies: Would complicate CORS handling
- Auth0: External dependency, overkill for this scope

**Implementation Pattern**:
1. Backend handles all auth: register, login, me endpoints
2. Password hashing: Passlib with bcrypt (rounds=12)
3. JWT issued by backend on successful register/login
4. Token stored in localStorage (frontend)
5. Frontend attaches JWT to Authorization header for protected routes
6. Backend verifies JWT with shared secret on all /api requests

**Best Practices**:
- JWT expiry: 60 minutes (Phase 2 requirement)
- No refresh token (Phase 2 simplicity)
- JWT_SECRET: minimum 32 characters, stored in environment variable
- Token format: `Authorization: Bearer <token>`
- User ID in JWT payload as `sub` claim

---

## 2. Database Design with SQLModel

### Decision: SQLModel with Neon Serverless PostgreSQL

**Rationale**: SQLModel combines Pydantic validation with SQLAlchemy ORM, providing type-safe database operations that integrate well with FastAPI's automatic OpenAPI generation. Using SQLModel's relationship features to establish proper foreign key relationships between users and tasks.

**Alternatives Considered**:
- Raw SQLAlchemy: More boilerplate, separate validation layer needed
- Tortoise ORM: Less mature, smaller community
- Prisma (Python): Beta stage, limited features
- No foreign key constraints: Compromises data integrity

**Best Practices**:
- Use `from __future__ import annotations` for Python 3.11+ forward references
- Define models with both `table=True` (DB) and Pydantic schemas (API)
- Use UUID for primary keys (better for distributed systems)
- Index frequently queried columns (user_id, created_at)
- Use `ondelete="CASCADE"` for foreign keys

**Connection Pooling**:
- Use asyncpg for async operations
- Connection pool size: 5-20 depending on load
- Idle timeout: 300 seconds
- Statement timeout: 30 seconds

---

## 3. Monorepo Structure

### Decision: Separate Frontend/Backend Directories

**Rationale**: Organizing the codebase with separate frontend and backend directories in a single repository to maintain clear separation of concerns while satisfying the monorepo requirement from the constitution.

**Alternatives Considered**:
- Single unified codebase: Violates separation of concerns
- Separate repositories: Violates monorepo requirement

**Structure**:
- `/frontend` - Next.js application
- `/backend` - FastAPI application
- `/specs` - Feature specifications
- Shared configuration at root level

---

## 4. API Design Patterns

### Decision: RESTful API with Resource-Based URLs

**Rationale**: REST is well-understood, works well with HTTP caching, and integrates seamlessly with frontend data fetching libraries. Using RESTful endpoints under /api with proper HTTP methods for all operations.

**Alternatives Considered**:
- GraphQL: Adds unnecessary complexity for this scope
- Custom API protocols: Violates standard practices

**URL Structure**:
```
/api/auth/register     POST   - User registration
/api/auth/login        POST   - User login
/api/auth/logout       POST   - User logout
/api/auth/me           GET    - Current user info

/api/tasks             GET    - List user's tasks (paginated)
/api/tasks             POST   - Create task
/api/tasks/{id}        GET    - Get single task
/api/tasks/{id}        PUT    - Update task
/api/tasks/{id}        DELETE - Delete task
/api/tasks/reorder     POST   - Bulk reorder tasks

/api/events            GET    - List user's events
/api/events            POST   - Create event
/api/events/{id}       GET    - Get single event
/api/events/{id}       PUT    - Update event
/api/events/{id}       DELETE - Delete event

/api/users/profile     GET    - Get user profile
/api/users/profile     PUT    - Update user profile
/api/users/onboarding  POST   - Mark onboarding complete
```

**Best Practices**:
- Use HTTP status codes correctly (200, 201, 400, 401, 404, 500)
- Return consistent error response format: `{ "detail": "message" }`
- Paginate list endpoints: `?page=1&limit=50`
- Use query params for filtering: `?completed=true`
- Return created/updated resource in response body
- All endpoints require JWT authentication in Authorization: Bearer header

---

## 5. Responsive Design Approach

### Decision: Tailwind CSS with Mobile-First

**Rationale**: Using Tailwind CSS utility classes with mobile-first approach to ensure the application works across all device sizes from 320px to 1920px as specified in the success criteria.

**Alternatives Considered**:
- Custom CSS framework: Increased development time
- Fixed-width layouts: Violates responsive requirement

**Breakpoints**:
- Mobile: 320px - 639px (default)
- Tablet: 640px - 1023px (sm:, md:)
- Desktop: 1024px - 1920px (lg:, xl:, 2xl:)

---

## 6. Frontend State Management

### Decision: React Server Components + Client Hooks

**Rationale**: Next.js App Router's server components reduce client-side JavaScript. Client components use custom hooks for local state and API interactions.

**Alternatives Considered**:
- Redux: Overkill for this scope, adds complexity
- Zustand: Good option, but hooks sufficient here
- TanStack Query: Consider for future caching needs

**Pattern**:
1. Server Components: Data fetching, initial render
2. Client Components: Interactive features (forms, drag-drop)
3. Custom Hooks: API calls, local state (useAuth, useTasks)
4. Context: Theme preference, auth state

**Best Practices**:
- Prefer server components when possible
- Use `'use client'` only when needed (event handlers, hooks)
- Centralized API client with retry logic (FR-032)
- Optimistic updates for better UX

---

## 7. Drag-and-Drop Implementation

### Decision: @dnd-kit Library

**Rationale**: @dnd-kit is the most modern, accessible, and performant drag-and-drop library for React. It has excellent TypeScript support and works with virtualized lists.

**Alternatives Considered**:
- react-beautiful-dnd: Deprecated by Atlassian
- react-dnd: Lower-level, more setup required
- HTML5 drag-and-drop: Poor mobile support, inconsistent

**Implementation Pattern**:
1. Wrap task list with DndContext
2. Each task is a Draggable with unique ID
3. On drag end, calculate new positions
4. Optimistic update: reorder locally immediately
5. API call: POST /api/tasks/reorder with new order
6. Rollback on error

**Best Practices**:
- Use `position` integer field (not float) for ordering
- Reorder algorithm: assign positions 0, 1, 2, 3... on save
- Debounce API calls if rapid reordering
- Respect prefers-reduced-motion (disable animations)

---

## 8. Calendar Implementation

### Decision: Custom Calendar with date-fns

**Rationale**: A custom calendar component provides full control over styling and behavior. date-fns is lightweight and tree-shakeable.

**Alternatives Considered**:
- FullCalendar: Heavy, complex licensing
- react-big-calendar: Good but requires moment.js
- @schedule-x/react: Newer, less documentation

**Implementation Pattern**:
1. Month view: Grid of days with task/event indicators
2. Day view: Timeline with events and task due dates
3. Click day: Show tasks/events for that day
4. Click empty slot: Create new event
5. Drag task to day: Set due date

**Best Practices**:
- Use date-fns for date manipulation (lightweight)
- Store dates in UTC, display in user's timezone
- Event times: ISO 8601 format with timezone
- Task due dates: Date only (no time component)

---

## 9. Onboarding Wizard

### Decision: Multi-Step Form with Local State

**Rationale**: A wizard guides first-time users through key features. Local state tracks progress; completion is persisted to user profile.

**Steps**:
1. Welcome: Brief intro to the app
2. Create First Task: Interactive demo
3. Explore Features: Quick tour of calendar, profile
4. Complete: Set theme preference, finish setup

**Implementation Pattern**:
1. Check onboarding_completed on dashboard mount
2. If false, redirect to /onboarding
3. Wizard steps as child routes or state machine
4. On complete: POST /api/users/onboarding
5. Update user context, redirect to dashboard

---

## 10. Theme System

### Decision: CSS Variables + Database Persistence

**Rationale**: CSS variables enable instant theme switching. Storing preference in database enables cross-device sync (FR-027).

**Implementation Pattern**:
1. Theme values: 'light' | 'dark' | 'system'
2. On load: Check user preference from API
3. Apply theme class to `<html>` element
4. System theme: Use prefers-color-scheme media query
5. On change: Update local + API

**CSS Variables**:
- --background, --foreground, --primary, --secondary
- --muted, --accent, --destructive, --border, --input

---

## 11. Error Handling & Retry Logic

### Decision: Centralized API Client with Exponential Backoff

**Rationale**: FR-032 requires auto-retry with "Reconnecting..." indicator. Centralized client ensures consistent behavior.

**Implementation Pattern**:
1. API client wraps all fetch calls
2. On network error: Retry up to 3 times
3. Backoff: 1s, 2s, 4s (exponential)
4. During retry: Show "Reconnecting..." toast
5. After 3 failures: Show error message

**Best Practices**:
- Only retry on network errors and 5xx responses
- Don't retry on 4xx (client errors)
- Include request ID for debugging
- Log errors for observability

---

## 12. Accessibility Considerations

### Decision: WCAG 2.1 AA Compliance Target

**Rationale**: Accessibility is required by FR-026 (prefers-reduced-motion) and constitution (Frontend Rules).

**Key Requirements**:
- Keyboard navigation for all interactive elements
- ARIA labels for custom components
- Focus management in modals and wizards
- Color contrast ratio: minimum 4.5:1
- prefers-reduced-motion: Disable Framer Motion animations

**Implementation**:
1. Use ShadCN UI (accessible by default)
2. Add useReducedMotion hook
3. Wrap Framer Motion with motion preference check
4. Test with screen readers (VoiceOver, NVDA)

---

## 13. Security Considerations

### Decision: Defense in Depth

**Layers**:
1. **Transport**: HTTPS only (enforced in production)
2. **Authentication**: JWT with short expiry, httpOnly cookies
3. **Authorization**: User ID from JWT, not from request body
4. **Input Validation**: Pydantic schemas on backend, zod on frontend
5. **Output Encoding**: Automatic via React/FastAPI
6. **SQL Injection**: Prevented by SQLModel ORM
7. **CSRF**: SameSite cookies + token verification
8. **XSS**: React's automatic escaping + CSP headers

**Password Storage (Phase 2 Rebuild)**:
- Passlib CryptContext with bcrypt scheme
- Cost factor (rounds): 12
- Never log passwords
- Minimum 8 characters (FR-001)
- Normalize email with `.strip().lower()` at both registration and login
- Implementation pattern:
  ```python
  from passlib.context import CryptContext
  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

  def hash_password(password: str) -> str:
      return pwd_context.hash(password)

  def verify_password(plain: str, hashed: str) -> bool:
      return pwd_context.verify(plain, hashed)
  ```

---

## 14. Performance Optimization

### Decision: Server Components + Edge Caching

**Strategies**:
1. **Server Components**: Reduce client JS bundle
2. **Image Optimization**: Next.js Image component for avatars
3. **Code Splitting**: Dynamic imports for heavy components
4. **API Caching**: Cache-Control headers for GET requests
5. **Database Indexes**: user_id, created_at, due_date
6. **Pagination**: 50 items per page (edge case clarification)

**Monitoring**:
- Vercel Analytics for frontend
- FastAPI timing middleware for backend
- Error tracking: Sentry or similar

---

## Conclusion

All technical decisions align with the constitution principles and spec requirements. The architecture prioritizes:
- Security (JWT, input validation, password hashing)
- Performance (server components, pagination, indexing)
- Accessibility (WCAG 2.1 AA, reduced motion support)
- Maintainability (clear separation, typed APIs, centralized error handling)

**Next Phase**: Generate data-model.md and API contracts.
