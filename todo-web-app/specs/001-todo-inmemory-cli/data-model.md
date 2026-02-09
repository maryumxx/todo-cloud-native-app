# Data Model: Todo In-Memory CLI Application

**Feature**: Todo In-Memory CLI Application
**Date**: 2026-01-16
**Author**: Claude Code

## Overview

This document defines the data model for the Todo In-Memory CLI Application based on the approved specification. It outlines the key entities, their attributes, relationships, and validation rules.

## Key Entities

### Task Entity

**Description**: Represents a single to-do item in the system

**Attributes**:
- **id** (integer, required)
  - Unique sequential identifier assigned automatically
  - Positive integer values only
  - Generated sequentially starting from 1

- **title** (string, required)
  - Task title/description in short form
  - Minimum length: 1 character
  - Maximum length: 200 characters
  - Cannot be empty or whitespace only

- **description** (string, optional)
  - Detailed description of the task
  - Maximum length: 1000 characters
  - Can be empty/None if not provided

- **completed** (boolean, required)
  - Completion status of the task
  - Default value: False (incomplete)
  - Values: True (complete) or False (incomplete)

### TaskList Collection

**Description**: In-memory collection that holds all Task entities during application runtime

**Characteristics**:
- Maintains all Task objects in memory during application lifecycle
- Automatically assigns unique sequential IDs to new tasks
- Provides lookup functionality by ID
- Thread-safe operations if needed for future extensions

## Validation Rules

### Task Creation Validation
1. Title must be provided and not empty/whitespace
2. Title must be between 1-200 characters
3. Description (if provided) must be ≤1000 characters
4. ID must be unique within the collection
5. ID must be positive integer

### Task Update Validation
1. Task with specified ID must exist
2. If title is provided, it must meet creation validation rules
3. If description is provided, it must meet creation validation rules
4. Completion status update must be boolean

### Task Deletion Validation
1. Task with specified ID must exist
2. Operation must return confirmation of deletion

### Task Status Update Validation
1. Task with specified ID must exist
2. Status value must be boolean (True/False)

## State Transitions

### Task Completion States
- **Incomplete** (completed=False) → **Complete** (completed=True)
- **Complete** (completed=True) → **Incomplete** (completed=False)

## Relationships

### Task to TaskList
- One-to-many: Each Task belongs to exactly one TaskList
- TaskList contains multiple Tasks
- TaskList manages ID assignment and uniqueness

## Data Access Patterns

### Read Operations
- Retrieve all tasks
- Retrieve task by ID
- Filter tasks by completion status

### Write Operations
- Create new task
- Update existing task (title, description)
- Update task completion status
- Delete task by ID

## Constraints

### Uniqueness Constraints
- Task ID must be unique within the TaskList
- No duplicate IDs allowed

### Integrity Constraints
- Referential integrity: operations on non-existent tasks must fail gracefully
- Data type integrity: all attributes must maintain correct data types

### Business Constraints
- Task titles cannot be empty
- Task IDs are auto-generated and sequential
- Data is stored in-memory only (transient)