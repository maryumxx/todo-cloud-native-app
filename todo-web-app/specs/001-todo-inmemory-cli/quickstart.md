# Quickstart Guide: Todo In-Memory CLI Application

**Feature**: Todo In-Memory CLI Application
**Date**: 2026-01-16
**Author**: Claude Code

## Overview

This quickstart guide provides instructions for setting up and running the Todo In-Memory CLI Application. The application is a console-based tool for managing personal to-do items with in-memory storage only.

## Prerequisites

- Python 3.13 or higher
- UV package manager (for dependency management as per constitution)

## Setup Instructions

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies using UV
uv sync
```

### 2. Verify Installation

```bash
# Run the application
python -m src.cli.main --help
```

## Usage Instructions

### Available Commands

The application supports the following operations:

#### Add a Task
```bash
python -m src.cli.main add --title "Task Title" --description "Task Description"
```
Or interactively:
```bash
python -m src.cli.main add
# Prompts for title and description
```

#### View All Tasks
```bash
python -m src.cli.main list
```

#### Update a Task
```bash
python -m src.cli.main update --id 1 --title "New Title" --description "New Description"
```

#### Mark Task Complete/Incomplete
```bash
# Mark complete
python -m src.cli.main complete --id 1

# Mark incomplete
python -m src.cli.main incomplete --id 1
```

#### Delete a Task
```bash
python -m src.cli.main delete --id 1
```

### Interactive Mode

The application also supports an interactive mode:
```bash
python -m src.cli.main interactive
```

This mode presents a menu-driven interface for all operations.

## Example Workflow

1. **Add a task**:
   ```bash
   python -m src.cli.main add --title "Buy groceries" --description "Milk, bread, eggs"
   ```

2. **View all tasks**:
   ```bash
   python -m src.cli.main list
   ```

3. **Mark task as complete**:
   ```bash
   python -m src.cli.main complete --id 1
   ```

4. **Update a task**:
   ```bash
   python -m src.cli.main update --id 1 --title "Buy groceries (done)" --description "Milk, bread, eggs, cheese"
   ```

5. **Delete a task**:
   ```bash
   python -m src.cli.main delete --id 1
   ```

## Configuration

The application has no configuration files as it stores data in-memory only. All settings are handled through command-line arguments.

## Troubleshooting

### Common Issues

1. **Python version error**: Ensure you're using Python 3.13 or higher
2. **Module not found**: Run from the project root directory
3. **Invalid ID error**: Check that the task ID exists in the current session

### Error Messages

- `"Task with ID X not found"`: The specified task ID does not exist in the current session
- `"Title cannot be empty"`: Task titles must contain at least one non-whitespace character
- `"Invalid command"`: Check the command syntax using `--help`

## Limitations

- Data is stored in-memory only and will be lost when the application exits
- Single-user application (no multi-user support)
- No data persistence between application runs