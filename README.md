# TodoForDevs CLI

A command-line interface for the TodoForDevs application, allowing developers to manage tasks and projects directly from the terminal.

## Overview

TodoForDevs CLI provides a fast, simple way to interact with the TodoForDevs application without leaving your terminal. It follows the core philosophy of the main application: simplicity and efficiency without unnecessary project management overhead.

## Current Status

⚠️ **Important Note:** This CLI is currently in development and requires backend API endpoints that are not yet implemented. See the "Known Issues" section below for details.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/todofordevs.git
   cd todofordevs/cli
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the CLI:

   ```bash
   pnpm build
   ```

4. Link the CLI globally (optional):
   ```bash
   pnpm link
   ```

## Usage

### Authentication

```bash
# Log in to TodoForDevs
todo auth login

# Check authentication status
todo auth status

# Log out
todo auth logout
```

### Project Management

```bash
# List all accessible projects
todo project list

# Select an active project
todo project select

# Show the currently active project
todo project current
```

### Task Management

```bash
# List tasks in the active project
todo task list

# List tasks with filtering
todo task list --status "In Progress" --priority "High"

# Add a new task (interactive prompts will follow)
todo task add

# View task details
todo task view <task_id>

# Update a task (interactive prompts will follow)
todo task update <task_id>

# Delete a task
todo task delete <task_id>
```

### Shortcuts

```bash
# Shortcut for 'todo task add'
todo add

# Shortcut for 'todo task list'
todo tasks
```

## Known Issues

1. **Backend API Endpoints**:

   - The CLI attempts to connect to `http://localhost:3000/api/auth/cli-login-initiate` for authentication, but this endpoint is not yet implemented in the backend.
   - To use the CLI, you need to start the TodoForDevs backend server and implement the required endpoints.

2. **Error Handling**:
   - Error messages can be verbose and not user-friendly.
   - We're working on improving error handling to provide more concise, helpful messages.

## Required Backend Endpoints

For the CLI to function properly, the following API endpoints need to be implemented in the TodoForDevs backend:

- **Authentication**:

  - `POST /api/auth/cli-login-initiate` - Initiates the CLI login process
  - `GET /api/auth/cli-token?code=<device_code>` - Polls for authentication token

- **Projects**:

  - `GET /api/projects` - Lists all accessible projects
  - `GET /api/projects/[projectId]` - Gets details for a specific project

- **Tasks**:
  - `GET /api/projects/[projectId]/tasks` - Lists tasks for a project
  - `POST /api/projects/[projectId]/tasks` - Creates a new task
  - `GET /api/tasks/[taskId]` - Gets details for a specific task
  - `PUT /api/tasks/[taskId]` - Updates a task
  - `DELETE /api/tasks/[taskId]` - Deletes a task

## Development

### Project Structure

```
cli/
├── src/                  # Source code
│   ├── commands/         # Command implementations
│   │   ├── auth.ts       # Authentication commands
│   │   ├── project.ts    # Project management commands
│   │   └── task.ts       # Task management commands
│   ├── utils/            # Utility functions
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Authentication utilities
│   │   ├── output.ts     # Output formatting
│   │   └── project.ts    # Project utilities
│   ├── config/           # Configuration management
│   │   └── index.ts      # Configuration utilities
│   ├── types.d.ts        # Type declarations
│   └── index.ts          # CLI entry point
├── dist/                 # Compiled JavaScript
├── package.json          # Project metadata and dependencies
└── tsconfig.json         # TypeScript configuration
```

### Scripts

- `pnpm build` - Builds the CLI
- `pnpm start` - Runs the CLI
- `pnpm dev` - Builds and runs the CLI
- `pnpm link` - Links the CLI globally

## Next Steps

1. Implement the required backend API endpoints
2. Improve error handling and user feedback
3. Add comprehensive documentation
4. Add tests

## License

ISC
