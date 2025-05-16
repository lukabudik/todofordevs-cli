import { Command } from "commander";
import * as task from "../utils/task";

/**
 * Register all task-related commands
 */
export function registerTaskCommands(program: Command): void {
  const taskCommand = program
    .command("task")
    .description("Task management commands");

  // List tasks command
  taskCommand
    .command("list")
    .alias("ls")
    .description("List tasks for the active project")
    .option("-p, --project <id>", "Project ID (overrides active project)")
    .option("-s, --status <status>", "Filter by status")
    .option("-r, --priority <priority>", "Filter by priority")
    .option("-a, --assignee <assignee>", "Filter by assignee")
    .option("--sort-by <field>", "Sort by field")
    .option("--sort-order <order>", "Sort order (asc or desc)")
    .action(async (options) => {
      await task.listTasks(options);
    });

  // Add task command
  taskCommand
    .command("add")
    .description("Add a new task to the active project")
    .option("-p, --project <id>", "Project ID (overrides active project)")
    .action(async (options) => {
      await task.addTask(options);
    });

  // View task command
  taskCommand
    .command("view <taskId>")
    .description("View details of a specific task")
    .action(async (taskId) => {
      await task.viewTask(taskId);
    });

  // Update task command
  taskCommand
    .command("update <taskId>")
    .description("Update an existing task")
    .action(async (taskId) => {
      await task.updateTask(taskId);
    });

  // Delete task command
  taskCommand
    .command("delete <taskId>")
    .alias("rm")
    .description("Delete a task")
    .action(async (taskId) => {
      await task.deleteTask(taskId);
    });

  // Add aliases at the program level for common commands
  program
    .command("add")
    .description("Shortcut for 'task add'")
    .option("-p, --project <id>", "Project ID (overrides active project)")
    .action(async (options) => {
      await task.addTask(options);
    });

  program
    .command("tasks")
    .description("Shortcut for 'task list'")
    .option("-p, --project <id>", "Project ID (overrides active project)")
    .option("-s, --status <status>", "Filter by status")
    .option("-r, --priority <priority>", "Filter by priority")
    .option("-a, --assignee <assignee>", "Filter by assignee")
    .option("--sort-by <field>", "Sort by field")
    .option("--sort-order <order>", "Sort order (asc or desc)")
    .action(async (options) => {
      await task.listTasks(options);
    });
}
