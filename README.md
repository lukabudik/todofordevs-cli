# TodoForDevs CLI

`todofordevs` is a command-line interface (CLI) for interacting with [TodoForDevs.com](https://todofordevs.com/), a task management tool designed specifically for developers. This CLI allows you to manage your tasks, projects, and authentication directly from your terminal.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
  - [Authentication (`auth`)](#authentication-auth)
  - [Project Management (`project`)](#project-management-project)
  - [Task Management (`task`)](#task-management-task)
- [Global Options](#global-options)
- [Development](#development)
- [License](#license)

## Installation

To install the TodoForDevs CLI, you need Node.js (version >=18.0.0) and pnpm.

```bash
pnpm install -g todofordevs
```

Alternatively, if you have cloned the repository, you can link it locally for development:

```bash
git clone https://todofordevs.com/ # (Replace with actual repository URL if different)
cd todofordevs-cli
pnpm install
pnpm run build
pnpm link --global
```

After installation, you can use the `todo` command.

## Usage

The basic syntax for the CLI is:

```bash
todo [command] [subcommand] [options]
```

To see a list of all available commands, run:

```bash
todo --help
```

Or for a specific command:

```bash
todo <command> --help
```

## Commands

The CLI is organized into several command groups:

### Authentication (`auth`)

Manage your TodoForDevs account session.

- **`todo auth login`**

  - Description: Log in to TodoForDevs. This will typically open a browser window for authentication.
  - Usage: `todo auth login`

- **`todo auth logout`**

  - Description: Log out from TodoForDevs, clearing your local session.
  - Usage: `todo auth logout`

- **`todo auth status`**
  - Description: Check your current authentication status.
  - Usage: `todo auth status`

### Project Management (`project`)

Manage your projects.

- **`todo project list`** (Alias: `ls`)

  - Description: List all projects you have access to.
  - Usage: `todo project list`

- **`todo project select`**

  - Description: Select an active project. Tasks will be managed within this project by default.
  - Usage: `todo project select` (This will likely present an interactive prompt)

- **`todo project current`**

  - Description: Show the currently selected active project.
  - Usage: `todo project current`

### Task Management (`task`)

Manage tasks within your projects.

- **`todo task list`** (Alias: `ls`)

  - Description: List tasks for the active project.
  - Usage: `todo task list [options]`
  - Options:
    - `-p, --project <id>`: Project ID to list tasks from (overrides the active project).
    - `-s, --status <status>`: Filter tasks by status (e.g., "todo", "inprogress", "done").
    - `-r, --priority <priority>`: Filter tasks by priority (e.g., "high", "medium", "low").
    - `-a, --assignee <assignee>`: Filter tasks by assignee (user ID or name).
    - `--sort-by <field>`: Field to sort tasks by (e.g., "createdAt", "priority", "status").
    - `--sort-order <order>`: Sort order ("asc" or "desc").
  - Shortcut: `todo tasks [options]`

- **`todo task add`**

  - Description: Add a new task to the active project. This will likely prompt for task details.
  - Usage: `todo task add [options]`
  - Options:
    - `-p, --project <id>`: Project ID to add the task to (overrides the active project).
  - Shortcut: `todo add [options]`

- **`todo task view <taskId>`**

  - Description: View detailed information about a specific task.
  - Usage: `todo task view <taskId>`

- **`todo task update <taskId>`**

  - Description: Update an existing task. This will likely prompt for the fields to update.
  - Usage: `todo task update <taskId>`

- **`todo task delete <taskId>`** (Alias: `rm`)
  - Description: Delete a task.
  - Usage: `todo task delete <taskId>`

## Global Options

- **`-h, --help`**: Display help for the command.

## Development

This project is built with TypeScript.

**Prerequisites:**

- Node.js (>=18.0.0)
- pnpm

**Setup:**

1. Clone the repository: `git clone <repository_url>` (Replace with actual URL)
2. Navigate to the project directory: `cd todofordevs-cli`
3. Install dependencies: `pnpm install`

**Available Scripts (from `package.json`):**

- `pnpm run build`: Compile TypeScript to JavaScript (output to `dist/`).
- `pnpm run start`: Run the compiled CLI (requires a prior build).
- `pnpm run dev`: Compile TypeScript and then run the CLI (useful for development).
- `pnpm run format`: Format code using Prettier.
- `pnpm run format:check`: Check code formatting with Prettier.
- `pnpm run lint`: Lint code using ESLint.
- `pnpm run lint:fix`: Lint code and automatically fix issues.
- `pnpm link --global`: Make the `todo` command available globally by linking the local build. This is useful for testing the CLI as if it were installed.

The main entry point for the CLI is `src/index.ts`. Commands are defined in the `src/commands/` directory. Utility functions are located in `src/utils/`.

## License

This project is licensed under the terms specified in [https://todofordevs.com/terms](https://todofordevs.com/terms).
