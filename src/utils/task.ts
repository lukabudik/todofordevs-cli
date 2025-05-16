import inquirer from 'inquirer';
import { get, post, put, del, endpoints } from './api';
import * as output from './output';
import { requireAuth } from './auth';
import { getActiveProjectId } from './project';

/**
 * Interface for a task
 */
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  assigneeId?: string;
  assigneeEmail?: string;
  assigneeName?: string;
  projectId: string;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for the API response containing tasks
 */
interface TasksResponse {
  tasks: Task[];
}

interface TaskCreationResponse {
  message: string;
  task: Task;
}

/**
 * Interface for task creation/update
 */
interface TaskInput {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  assigneeId?: string;
}

/**
 * List tasks for a project
 */
export async function listTasks(options: any = {}): Promise<Task[]> {
  if (!requireAuth()) return [];

  try {
    // Get the project ID (from options or active project)
    const projectId = await getActiveProjectId(options.project);

    if (!projectId) {
      output.error(
        'No project specified. Use --project or select an active project.',
      );
      return [];
    }

    output.info(`Fetching tasks for project ID: ${projectId}...`);

    // Build query parameters
    const params: Record<string, string> = {};
    if (options.status) params.status = options.status;
    if (options.priority) params.priority = options.priority;
    if (options.assignee) params.assignee = options.assignee;
    if (options.sortBy) params.sortBy = options.sortBy;
    if (options.sortOrder) params.sortOrder = options.sortOrder;

    // Fetch tasks
    const response = await get<TasksResponse>(
      endpoints.tasks.list(projectId, params),
    );
    const tasks = response.tasks || [];

    if (tasks.length === 0) {
      output.info('No tasks found.');
      return [];
    }

    // Display tasks in a table
    const table = output.createTable([
      'ID',
      'Title',
      'Status',
      'Priority',
      'Assignee',
      'Due Date',
    ]);

    tasks.forEach((task) => {
      table.push([
        output.truncate(task.id, 10),
        output.truncate(task.title, 30),
        task.status,
        task.priority,
        output.truncate(
          task.assigneeEmail || task.assigneeName || 'Unassigned',
          20,
        ),
        output.formatDate(task.dueDate),
      ]);
    });

    console.log(table.toString());
    return tasks;
  } catch (error) {
    output.error('Failed to fetch tasks.');
    console.error(error);
    return [];
  }
}

/**
 * Add a new task
 */
export async function addTask(options: any = {}): Promise<void> {
  if (!requireAuth()) return;

  try {
    // Get the project ID (from options or active project)
    const projectId = await getActiveProjectId(options.project);

    if (!projectId) {
      output.error(
        'No project specified. Use --project or select an active project.',
      );
      return;
    }

    // Prompt for task details
    const taskInput = await promptForTaskDetails();

    if (!taskInput) {
      output.info('Task creation cancelled.');
      return;
    }

    output.info('Creating task...');

    // Create the task
    const response = await post<TaskCreationResponse>(
      endpoints.tasks.create(projectId),
      taskInput,
    );

    output.success(
      `Task '${response.task.title}' created successfully with ID: ${response.task.id}.`,
    );
  } catch (error) {
    output.error('Failed to create task.');
    console.error(error);
  }
}

/**
 * View a task's details
 */
export async function viewTask(taskId: string): Promise<void> {
  if (!requireAuth()) return;

  try {
    output.info(`Fetching task details for ID: ${taskId}...`);

    // Fetch the task
    const task = await get<Task>(endpoints.tasks.get(taskId));

    // Display task details
    output.heading('Task Details');
    output.formatKeyValue('ID', task.id);
    output.formatKeyValue('Title', task.title);
    output.formatKeyValue('Description', task.description || '');
    output.formatKeyValue('Status', task.status);
    output.formatKeyValue('Priority', task.priority);
    output.formatKeyValue('Due Date', output.formatDate(task.dueDate));
    output.formatKeyValue(
      'Assignee',
      task.assigneeEmail || task.assigneeName || 'Unassigned',
    );
    output.formatKeyValue('Project ID', task.projectId);
    output.formatKeyValue('Project Name', task.projectName || '');
    output.formatKeyValue(
      'Created At',
      new Date(task.createdAt).toLocaleString(),
    );
    output.formatKeyValue(
      'Updated At',
      new Date(task.updatedAt).toLocaleString(),
    );
  } catch (error) {
    output.error(`Failed to fetch task with ID: ${taskId}.`);
    console.error(error);
  }
}

/**
 * Update a task
 */
export async function updateTask(taskId: string): Promise<void> {
  if (!requireAuth()) return;

  try {
    output.info(`Fetching task details for ID: ${taskId}...`);

    // Fetch the current task
    const task = await get<Task>(endpoints.tasks.get(taskId));

    // Prompt for updates
    const updates = await promptForTaskUpdates(task);

    if (!updates) {
      output.info('Task update cancelled.');
      return;
    }

    output.info('Updating task...');

    // Update the task
    await put(endpoints.tasks.update(taskId), updates);

    output.success(
      `Task '${updates.title || task.title}' (ID: ${taskId}) updated successfully.`,
    );
  } catch (error) {
    output.error(`Failed to update task with ID: ${taskId}.`);
    console.error(error);
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  if (!requireAuth()) return;

  try {
    // Fetch the task to get its title
    let taskTitle = 'Unknown';
    try {
      const task = await get<Task>(endpoints.tasks.get(taskId));
      taskTitle = task.title || 'Unknown';
    } catch (fetchError) {
      output.warning(`Could not fetch task details: ${fetchError}`);
    }

    // Confirm deletion
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete task ${taskId} '${taskTitle}'?`,
        default: false,
      },
    ]);

    if (!confirm) {
      output.info('Task deletion cancelled.');
      return;
    }

    output.info('Deleting task...');

    // Delete the task
    await del(endpoints.tasks.delete(taskId));

    output.success(`Task '${taskTitle}' (ID: ${taskId}) deleted successfully.`);
  } catch (error) {
    output.error(`Failed to delete task with ID: ${taskId}.`);
    console.error(error);
  }
}

/**
 * Prompt for task details
 */
async function promptForTaskDetails(): Promise<TaskInput | null> {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Title:',
        validate: (input) => input.trim() !== '' || 'Title is required',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
      },
      {
        type: 'list',
        name: 'status',
        message: 'Status:',
        choices: ['To Do', 'In Progress', 'Blocked', 'Done'],
        default: 'To Do',
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
      },
      {
        type: 'input',
        name: 'dueDate',
        message: 'Due Date (YYYY-MM-DD, optional):',
        validate: (input) => {
          if (!input) return true;
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(input)) {
            return 'Please use YYYY-MM-DD format';
          }
          const date = new Date(input);
          return !isNaN(date.getTime()) || 'Invalid date';
        },
      },
      {
        type: 'input',
        name: 'assigneeId',
        message: 'Assignee ID/Email (optional):',
      },
    ]);

    return {
      title: answers.title,
      description: answers.description || undefined,
      status: answers.status as any,
      priority: answers.priority as any,
      dueDate: answers.dueDate || undefined,
      assigneeId: answers.assigneeId || undefined,
    };
  } catch (error) {
    console.error('Error during task creation prompt:', error);
    return null;
  }
}

/**
 * Prompt for task updates
 */
async function promptForTaskUpdates(
  currentTask: Task,
): Promise<TaskInput | null> {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Title:',
        default: currentTask.title,
        validate: (input) => input.trim() !== '' || 'Title is required',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
        default: currentTask.description || '',
      },
      {
        type: 'list',
        name: 'status',
        message: 'Status:',
        choices: ['To Do', 'In Progress', 'Blocked', 'Done'],
        default: currentTask.status,
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: ['Low', 'Medium', 'High', 'Urgent'],
        default: currentTask.priority,
      },
      {
        type: 'input',
        name: 'dueDate',
        message: 'Due Date (YYYY-MM-DD, optional):',
        default: currentTask.dueDate || '',
        validate: (input) => {
          if (!input) return true;
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(input)) {
            return 'Please use YYYY-MM-DD format';
          }
          const date = new Date(input);
          return !isNaN(date.getTime()) || 'Invalid date';
        },
      },
      {
        type: 'input',
        name: 'assigneeId',
        message: 'Assignee ID/Email (optional):',
        default: currentTask.assigneeId || currentTask.assigneeEmail || '',
      },
    ]);

    return {
      title: answers.title,
      description: answers.description || undefined,
      status: answers.status as any,
      priority: answers.priority as any,
      dueDate: answers.dueDate || undefined,
      assigneeId: answers.assigneeId || undefined,
    };
  } catch (error) {
    console.error('Error during task update prompt:', error);
    return null;
  }
}
