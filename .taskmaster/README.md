# Taskmaster Setup

Taskmaster is a task management system integrated with this project. It helps you organize, track, and manage development tasks.

## Directory Structure

```
.taskmaster/
├── docs/
│   └── prd.txt          # Product Requirements Document (optional)
└── README.md            # This file
```

## Getting Started

1. **Add a PRD (Optional)**: If you have a Product Requirements Document, place it in `.taskmaster/docs/prd.txt`

2. **Parse PRD**: Use the `parse_prd` tool to automatically generate tasks from your PRD:
   ```
   parse_prd with projectRoot="/Users/alexbenson/Vibe Coding Repos/maple-leaf-admin"
   ```

3. **View Tasks**: Use `get_tasks` to see all tasks:
   ```
   get_tasks with projectRoot="/Users/alexbenson/Vibe Coding Repos/maple-leaf-admin"
   ```

4. **Get Next Task**: Use `next_task` to find what to work on next:
   ```
   next_task with projectRoot="/Users/alexbenson/Vibe Coding Repos/maple-leaf-admin"
   ```

## Available Tools

- `get_tasks` - Get all tasks, optionally filtered by status
- `get_task` - Get detailed information about a specific task
- `next_task` - Find the next task to work on based on dependencies
- `parse_prd` - Parse a PRD to generate initial tasks
- `expand_task` - Break down a task into subtasks
- `set_task_status` - Update task status (pending, in-progress, done, etc.)
- `update_subtask` - Add timestamped information to a subtask

## Task Statuses

- `pending` - Task is waiting to be started
- `in-progress` - Task is currently being worked on
- `done` - Task is completed
- `deferred` - Task is postponed
- `cancelled` - Task is cancelled
- `blocked` - Task is blocked by dependencies
- `review` - Task is ready for review
