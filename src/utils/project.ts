import inquirer from "inquirer";
import { get, post, endpoints } from "./api"; // Added post
import {
  getActiveProject,
  setActiveProject,
  clearActiveProject,
} from "../config";
import * as output from "./output";
import { requireAuth } from "./auth";

/**
 * Interface for a project
 */
interface Project {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail?: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name?: string;
    email: string;
  };
}

/**
 * Interface for the API response containing projects
 */
interface ProjectsResponse {
  projects: Project[];
}

interface ProjectCreationResponse {
  message: string;
  project: Project;
}

/**
 * List all projects accessible to the authenticated user
 */
export async function listProjects(): Promise<Project[]> {
  if (!requireAuth()) return [];

  try {
    output.info("Fetching projects...");

    // Get the response from the API
    const response = await get<any>(endpoints.projects.list());

    // Handle both possible response formats
    let projects: Project[] = [];

    if (Array.isArray(response)) {
      // If the response is already an array, use it directly
      projects = response;
    } else if (response && typeof response === "object") {
      // If the response is an object, check if it has a projects property
      if (Array.isArray(response.projects)) {
        projects = response.projects;
      } else {
        // If no projects property or it's not an array, try to convert the object to an array
        const possibleProjects = Object.values(response).find((val) =>
          Array.isArray(val)
        );
        if (possibleProjects) {
          projects = possibleProjects as Project[];
        }
      }
    }

    if (projects.length === 0) {
      output.info("No projects found.");
      return [];
    }

    // Display projects in a table
    const table = output.createTable(["ID", "Name", "Owner", "Last Updated"]);

    projects.forEach((project) => {
      table.push([
        output.truncate(project.id, 20),
        output.truncate(project.name, 30),
        output.truncate(project.ownerEmail || project.ownerId, 25),
        output.formatDate(project.updatedAt),
      ]);
    });

    console.log(table.toString());
    return projects;
  } catch (error) {
    output.error("Failed to fetch projects.");
    console.error(error);
    return [];
  }
}

/**
 * Select a project to set as active
 */
export async function selectProject(): Promise<void> {
  if (!requireAuth()) return;

  try {
    // Fetch projects
    const response = await get<any>(endpoints.projects.list());

    // Handle both possible response formats
    let projects: Project[] = [];

    if (Array.isArray(response)) {
      // If the response is already an array, use it directly
      projects = response;
    } else if (response && typeof response === "object") {
      // If the response is an object, check if it has a projects property
      if (Array.isArray(response.projects)) {
        projects = response.projects;
      } else {
        // If no projects property or it's not an array, try to convert the object to an array
        const possibleProjects = Object.values(response).find((val) =>
          Array.isArray(val)
        );
        if (possibleProjects) {
          projects = possibleProjects as Project[];
        }
      }
    }

    if (projects.length === 0) {
      output.info("No projects found to select from.");
      return;
    }

    // Prompt user to select a project
    const { selectedId } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedId",
        message: "Select a project to set as active:",
        choices: projects.map((project) => ({
          name: `${project.name} (${output.truncate(project.id, 10)})`,
          value: project.id,
          short: project.name,
        })),
      },
    ]);

    // Find the selected project
    const selectedProject = projects.find((p) => p.id === selectedId);

    if (selectedProject) {
      // Set as active project
      setActiveProject(selectedProject.id, selectedProject.name);
      output.success(
        `Project '${selectedProject.name}' (ID: ${selectedProject.id}) is now active.`
      );
    } else {
      output.error("Failed to set active project. Invalid selection.");
    }
  } catch (error) {
    output.error("Failed to select project.");
    console.error(error);
  }
}

/**
 * Display the currently active project
 */
export function showCurrentProject(): void {
  if (!requireAuth()) return;

  const activeProject = getActiveProject();

  if (activeProject) {
    output.success(
      `Current active project: '${activeProject.name}' (ID: ${activeProject.id}).`
    );
  } else {
    output.info("No active project selected. Use 'todo project select'.");
  }
}

/**
 * Get the active project ID, prompting to select one if none is set
 * Returns undefined if no project is selected or if the user cancels
 */
export async function getActiveProjectId(
  projectIdOverride?: string
): Promise<string | undefined> {
  // If a project ID override is provided, use it
  if (projectIdOverride) {
    return projectIdOverride;
  }

  // Check if there's an active project
  const activeProject = getActiveProject();
  if (activeProject) {
    return activeProject.id;
  }

  // No active project, prompt to select one
  output.info("No active project set.");

  // Ask if the user wants to select a project now
  const { selectNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "selectNow",
      message: "Would you like to select a project now?",
      default: true,
    },
  ]);

  if (selectNow) {
    await selectProject();
    const newActiveProject = getActiveProject();
    return newActiveProject?.id;
  }

  return undefined;
}

/**
 * Create a new project
 */
export async function createProject(name: string): Promise<Project | null> {
  if (!requireAuth()) return null;
  try {
    if (!name || name.trim() === "") {
      output.error("Project name cannot be empty.");
      return null;
    }
    output.info(`Creating project "${name}"...`);
    const response = await post<ProjectCreationResponse>(
      endpoints.projects.create(),
      { name }
    );
    output.success(
      `${response.message} (ID: ${response.project.id}, Name: ${response.project.name})`
    );
    return response.project;
  } catch (error) {
    output.error("Failed to create project.");
    // console.error(error); // Keep commented for prod
    return null;
  }
}
