# Data Model: AI Chatbot with MCP Tools

**Feature**: AI Chatbot with MCP Tools
**Branch**: 1-ai-chatbot-mcp
**Created**: 2026-01-23

## Entity: Task
**Description**: Represents a user's task with completion status and metadata
**Fields**:
- id (UUID): Unique identifier for the task
- user_id (UUID): Reference to the user who owns the task
- title (String): The task title or description
- description (String, optional): Additional details about the task
- completed (Boolean): Whether the task is completed
- created_at (DateTime): Timestamp when task was created
- updated_at (DateTime): Timestamp when task was last updated

**Validation Rules**:
- title must be non-empty
- user_id must reference an existing user
- created_at and updated_at are automatically set

**State Transitions**:
- created → pending (initial state)
- pending → completed (when task is marked complete)
- completed → pending (when task is unmarked as complete)

## Entity: Conversation
**Description**: Groups related messages between user and AI in a single conversation
**Fields**:
- id (UUID): Unique identifier for the conversation
- user_id (UUID): Reference to the user who owns the conversation
- created_at (DateTime): Timestamp when conversation was started
- updated_at (DateTime): Timestamp when conversation was last updated

**Validation Rules**:
- user_id must reference an existing user
- created_at and updated_at are automatically set

## Entity: Message
**Description**: Individual communication in a conversation between user and AI
**Fields**:
- id (UUID): Unique identifier for the message
- conversation_id (UUID): Reference to the conversation this message belongs to
- user_id (UUID): Reference to the user who sent the message
- role (Enum): Either 'user' or 'assistant'
- content (String): The text content of the message
- created_at (DateTime): Timestamp when message was created

**Validation Rules**:
- conversation_id must reference an existing conversation
- user_id must reference an existing user
- role must be either 'user' or 'assistant'
- content must be non-empty
- created_at is automatically set

**Relationships**:
- Conversation (1) → Messages (Many): One conversation has many messages
- User (1) → Conversations (Many): One user has many conversations
- User (1) → Tasks (Many): One user has many tasks
- User (1) → Messages (Many): One user sends many messages

**Indexes**:
- Task: (user_id, created_at), (user_id, completed)
- Conversation: (user_id, created_at)
- Message: (conversation_id, created_at), (user_id, created_at)