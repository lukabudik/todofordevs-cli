import { Command } from "commander";
import * as auth from "../utils/auth";

/**
 * Register all authentication-related commands
 */
export function registerAuthCommands(program: Command): void {
  const authCommand = program
    .command("auth")
    .description("Authentication commands");

  // Login command
  authCommand
    .command("login")
    .description("Log in to TodoForDevs")
    .action(async () => {
      await auth.initiateLogin();
    });

  // Logout command
  authCommand
    .command("logout")
    .description("Log out from TodoForDevs")
    .action(() => {
      auth.logout();
    });

  // Status command
  authCommand
    .command("status")
    .description("Check authentication status")
    .action(() => {
      auth.checkStatus();
    });
}
