import { Command } from 'commander';
import * as project from '../utils/project';

/**
 * Register all project-related commands
 */
export function registerProjectCommands(program: Command): void {
  const projectCommand = program
    .command('project')
    .description('Project management commands');

  // List projects command
  projectCommand
    .command('list')
    .alias('ls')
    .description('List all accessible projects')
    .action(async () => {
      await project.listProjects();
    });

  // Select project command
  projectCommand
    .command('select')
    .description('Select an active project')
    .action(async () => {
      await project.selectProject();
    });

  // Current project command
  projectCommand
    .command('current')
    .description('Show the currently active project')
    .action(() => {
      project.showCurrentProject();
    });
}
