import open from 'open';
import clipboardy from 'clipboardy';
import { get, post, endpoints } from './api';
import {
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
  getAuthUser,
} from '../config';
import * as output from './output';

/**
 * Interface for the authentication response
 */
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

/**
 * Interface for the device code response
 */
interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

/**
 * Initiate the browser-based login flow
 * @param silent If true, don't show browser window or output messages (for token refresh)
 */
export async function initiateLogin(silent: boolean = false): Promise<void> {
  try {
    // Step 1: Request a device code
    if (!silent) {
      output.info('Initiating login process...');
    }

    const deviceCodeResponse = await post<DeviceCodeResponse>(
      endpoints.auth.login(),
    );

    // Step 2: Display the verification URI and user code (if not silent)
    if (!silent) {
      output.heading('Authentication Required');
      output.info('To authenticate, please follow these steps:');
      output.info(
        `1. Open this URL in your browser: ${output.truncate(deviceCodeResponse.verification_uri, 50)}`,
      );

      // Copy the code to clipboard
      try {
        await clipboardy.write(deviceCodeResponse.user_code);
        output.info(
          `2. Enter this code: ${deviceCodeResponse.user_code} (copied to clipboard)`,
        );
      } catch (clipboardError) {
        // Fallback if clipboard access fails
        output.info(`2. Enter this code: ${deviceCodeResponse.user_code}`);
      }

      // Step 3: Open the browser to the verification URI (if not silent)
      await open(deviceCodeResponse.verification_uri);

      // Step 4: Poll for the token
      output.info('Waiting for authentication to complete...');
    }

    const token = await pollForToken(
      deviceCodeResponse.device_code,
      deviceCodeResponse.interval,
      deviceCodeResponse.expires_in,
      silent,
    );

    // Step 5: Store the token
    if (token) {
      if (!silent) {
        output.success('Authentication successful!');
        const user = getAuthUser();
        if (user) {
          output.info(
            `Logged in as ${user.email}${user.name ? ` (${user.name})` : ''}`,
          );
        }
      }
    } else {
      if (!silent) {
        output.error('Authentication failed or timed out.');
      }
    }
  } catch (error) {
    if (!silent) {
      output.error('Failed to initiate login process.');
      console.error(error);
    }
    throw error; // Re-throw for silent mode to handle
  }
}

/**
 * Poll for the authentication token with exponential backoff
 * @param deviceCode The device code to poll for
 * @param initialInterval The initial polling interval in seconds
 * @param expiresIn The expiration time in seconds
 * @param silent If true, don't show progress indicator or output messages
 */
async function pollForToken(
  deviceCode: string,
  initialInterval: number,
  expiresIn: number,
  silent: boolean = false,
): Promise<boolean> {
  const startTime = Date.now();
  const expiresAt = startTime + expiresIn * 1000;

  // Initialize polling parameters
  let interval = initialInterval;
  const maxInterval = 30; // Maximum polling interval in seconds
  const backoffFactor = 1.5; // Exponential backoff factor

  // Initialize progress indicator (if not silent)
  let dots = 0;
  const maxDots = 3;
  let progressInterval: NodeJS.Timeout | null = null;

  if (!silent) {
    progressInterval = setInterval(() => {
      process.stdout.write('\r');
      process.stdout.write(
        `Waiting for authentication${'.'.repeat(dots)}${' '.repeat(maxDots - dots)}`,
      );
      dots = (dots + 1) % (maxDots + 1);
    }, 1000);
  }

  try {
    // Poll until we get a token or timeout
    let attempts = 0;

    while (Date.now() < expiresAt) {
      attempts++;

      try {
        // Wait for the current interval
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));

        // Check if the user has completed the authentication
        const response = await get<AuthResponse>(
          endpoints.auth.token(deviceCode),
        );

        if (response && response.token) {
          // Clear the progress indicator (if not silent)
          if (progressInterval) {
            clearInterval(progressInterval);
            process.stdout.write('\r' + ' '.repeat(50) + '\r');
          }

          // Store the token and user info
          setAuthToken(response.token, response.user);
          return true;
        }
      } catch (error: any) {
        // If the error is "authorization_pending", continue polling with backoff silently
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data &&
          error.response.data.error === 'authorization_pending'
        ) {
          // Apply exponential backoff, but don't exceed the maximum interval
          interval = Math.min(interval * backoffFactor, maxInterval);
          continue;
        }

        // For other errors, log and continue polling (if not silent)
        if (!silent) {
          if (progressInterval) {
            clearInterval(progressInterval);
            process.stdout.write('\r' + ' '.repeat(50) + '\r');
          }

          // Only show error message for non-authorization_pending errors
          output.warning(
            `Error polling for token (attempt ${attempts}): ${error.message}`,
          );
          output.info('Retrying...');

          // Restart the progress indicator
          dots = 0;
          progressInterval = setInterval(() => {
            process.stdout.write('\r');
            process.stdout.write(
              `Waiting for authentication${'.'.repeat(dots)}${' '.repeat(maxDots - dots)}`,
            );
            dots = (dots + 1) % (maxDots + 1);
          }, 1000);
        }
      }
    }

    // Clear the progress indicator if we time out (if not silent)
    if (progressInterval) {
      clearInterval(progressInterval);
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }

    if (!silent) {
      output.warning('Authentication timed out. Please try again.');
    }

    return false;
  } catch (error) {
    // Clear the progress indicator if there's an unexpected error (if not silent)
    if (progressInterval) {
      clearInterval(progressInterval);
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }
    throw error;
  }
}

/**
 * Log out the current user
 */
export function logout(): void {
  clearAuthToken();
  output.success('Successfully logged out.');
}

/**
 * Check and display the current authentication status
 */
export function checkStatus(): void {
  if (isAuthenticated()) {
    const user = getAuthUser();
    if (user) {
      output.success(
        `Logged in as ${user.email}${user.name ? ` (${user.name})` : ''}`,
      );
    } else {
      output.success('Logged in');
    }
  } else {
    output.info("Not logged in. Run 'todo auth login' to authenticate.");
  }
}

/**
 * Verify that the user is authenticated
 * Returns true if authenticated, false otherwise
 * If not authenticated, displays an error message
 */
export function requireAuth(): boolean {
  if (!isAuthenticated()) {
    output.error('Authentication required.');
    output.info("Please run 'todo auth login' to authenticate.");
    return false;
  }
  return true;
}
