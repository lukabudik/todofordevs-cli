import { Command } from "commander";
import configStore, { setApiUrl, getApiUrl } from "../config"; // Import default config store
import { refreshApiConfig } from "../utils/api";
import * as output from "../utils/output";

// Create a config command
const configCommand = new Command("config").description(
  "Manage CLI configuration"
);

// Command to set the API URL
configCommand
  .command("set-api-url")
  .description("Set the API URL for the CLI")
  .argument("<url>", "The API URL to use (e.g., http://localhost:3000/api)")
  .action(async (url: string) => {
    try {
      // Validate the URL
      try {
        new URL(url);
      } catch (error) {
        output.error("Invalid URL format.");
        output.info("Example: http://localhost:3000/api");
        return;
      }

      // Set the API URL in configuration
      setApiUrl(url);

      // Refresh the API client configuration
      refreshApiConfig();

      output.success(`API URL set to: ${url}`);
    } catch (error) {
      output.error(`Failed to set API URL: ${error}`);
    }
  });

// Command to get the current API URL
configCommand
  .command("get-api-url")
  .description("Get the current API URL")
  .action(() => {
    try {
      const apiUrl = getApiUrl();
      output.success(`Current API URL: ${apiUrl}`);
    } catch (error) {
      output.error(`Failed to get API URL: ${error}`);
    }
  });

// Command to list all configuration
configCommand
  .command("list")
  .alias("ls")
  .description("List all configuration settings")
  .action(() => {
    try {
      const allConfig = configStore.store;
      if (allConfig.auth && allConfig.auth.token) {
        allConfig.auth.token = "[REDACTED]"; // Redact token for display
      }
      output.info("Current CLI Configuration:");
      console.log(JSON.stringify(allConfig, null, 2));
    } catch (error) {
      output.error(`Failed to list configuration: ${error}`);
    }
  });

// Command to get a specific configuration key
configCommand
  .command("get <key>")
  .description("Get a specific configuration key")
  .action((key: string) => {
    try {
      if (key === "auth.token") {
        output.error("Cannot display sensitive token. Use 'auth status'.");
        return;
      }
      const value = configStore.get(key as any); // Use 'as any' for dynamic keys
      if (value === undefined) {
        output.info(`Configuration key '${key}' not found.`);
      } else {
        output.info(`Value for '${key}':`);
        console.log(JSON.stringify(value, null, 2));
      }
    } catch (error) {
      output.error(`Failed to get configuration key '${key}': ${error}`);
    }
  });

// Command to set a specific configuration key
configCommand
  .command("set <key> <value>")
  .description(
    "Set a specific configuration key (use dot notation for nested keys, e.g., auth.user.name)"
  )
  .action((key: string, value: string) => {
    try {
      if (key === "auth.token") {
        output.error("Cannot set token directly. Use 'auth login'.");
        return;
      }
      // Attempt to parse value as JSON if it looks like it
      let parsedValue: any = value;
      if (
        (value.startsWith("{") && value.endsWith("}")) ||
        (value.startsWith("[") && value.endsWith("]"))
      ) {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          // Not valid JSON, treat as string
        }
      } else if (value === "true") {
        parsedValue = true;
      } else if (value === "false") {
        parsedValue = false;
      } else if (!isNaN(Number(value))) {
        parsedValue = Number(value);
      }

      configStore.set(key as any, parsedValue); // Use 'as any' for dynamic keys
      output.success(`Configuration key '${key}' set.`);
      if (key === "apiUrl") {
        refreshApiConfig();
        output.info("API client configuration refreshed.");
      }
    } catch (error) {
      output.error(`Failed to set configuration key '${key}': ${error}`);
    }
  });

// Command to delete a specific configuration key
configCommand
  .command("delete <key>")
  .alias("rm")
  .description("Delete a specific configuration key")
  .action((key: string) => {
    try {
      if (key.startsWith("auth")) {
        output.error(
          "Cannot delete auth keys directly. Use 'auth logout' to clear all auth data."
        );
        return;
      }
      if (!configStore.has(key as any)) {
        output.info(`Configuration key '${key}' not found. Nothing to delete.`);
        return;
      }
      configStore.delete(key as any); // Use 'as any' for dynamic keys
      output.success(`Configuration key '${key}' deleted.`);
      if (key === "apiUrl") {
        refreshApiConfig();
        output.info("API client configuration refreshed.");
      }
    } catch (error) {
      output.error(`Failed to delete configuration key '${key}': ${error}`);
    }
  });

export default configCommand;
