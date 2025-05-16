import Conf from 'conf';

// Define the structure of our configuration
interface CliConfig {
  activeProject?: {
    id: string;
    name: string;
  };
  auth?: {
    token: string;
    expiresAt?: number;
    user?: {
      id: string;
      email: string;
      name?: string;
    };
  };
}

// Create a configuration instance
const config = new Conf<CliConfig>({
  projectName: 'todofordevs',
  schema: {
    activeProject: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
    auth: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        expiresAt: { type: 'number' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  },
});

/**
 * Get the active project from configuration
 */
export function getActiveProject(): { id: string; name: string } | undefined {
  return config.get('activeProject');
}

/**
 * Set the active project in configuration
 */
export function setActiveProject(id: string, name: string): void {
  config.set('activeProject', { id, name });
}

/**
 * Clear the active project from configuration
 */
export function clearActiveProject(): void {
  config.delete('activeProject');
}

/**
 * Get the authentication token from configuration
 */
export function getAuthToken(): string | undefined {
  return config.get('auth.token');
}

/**
 * Set the authentication token in configuration
 */
export function setAuthToken(
  token: string,
  user?: { id: string; email: string; name?: string },
): void {
  config.set('auth', {
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    user,
  });
}

/**
 * Clear the authentication token from configuration
 */
export function clearAuthToken(): void {
  config.delete('auth');
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  // Check if the token is expired
  const expiresAt = config.get('auth.expiresAt');
  if (expiresAt && typeof expiresAt === 'number') {
    // If the token expires in less than 5 minutes, consider it expired
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    if (expiresAt < fiveMinutesFromNow) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the token needs to be refreshed
 * Returns true if the token is valid but will expire soon
 */
export function needsTokenRefresh(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  // Check if the token will expire soon
  const expiresAt = config.get('auth.expiresAt');
  if (expiresAt && typeof expiresAt === 'number') {
    // If the token expires in less than 1 hour, it needs to be refreshed
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;
    if (expiresAt < oneHourFromNow) {
      return true;
    }
  }

  return false;
}

/**
 * Get the authenticated user from configuration
 */
export function getAuthUser():
  | { id: string; email: string; name?: string }
  | undefined {
  return config.get('auth.user');
}

/**
 * Get the API URL
 */
export function getApiUrl(): string {
  return 'https://localhost:3000/api';
}

export default config;
