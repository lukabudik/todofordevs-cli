#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { registerAuthCommands } from './commands/auth';
import { registerProjectCommands } from './commands/project';
import { registerTaskCommands } from './commands/task';

// Create the main program
const program = new Command();

// Set up basic program information
program
  .name('todo')
  .description('TodoForDevs CLI - A simple task management tool for developers')
  .version('1.1.0');

// Register command groups
registerAuthCommands(program);
registerProjectCommands(program);
registerTaskCommands(program);

// Add a global help flag
program.helpOption('-h, --help', 'Display help for command');

// Handle unknown commands
program.on('command:*', (operands) => {
  console.error(chalk.red(`Error: unknown command '${operands[0]}'`));
  const availableCommands = program.commands.map((cmd) => cmd.name());
  console.error(
    chalk.yellow(`Available commands: ${availableCommands.join(', ')}`),
  );
  console.error('');
  console.error(
    `Run ${chalk.cyan('todo --help')} for a list of available commands.`,
  );
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length === 2) {
  program.outputHelp();
}
