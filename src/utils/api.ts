import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getAuthToken,
  getApiUrl,
  needsTokenRefresh,
  isAuthenticated,
} from '../config';
import * as output from './output';
import * as auth from './auth';

// Create a base axios instance for API requests
const api: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and handle token refresh
api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  // Skip token check for auth endpoints
  const isAuthEndpoint = config.url?.includes('/auth/');

  if (!isAuthEndpoint) {
    // Check if token needs refresh
    if (needsTokenRefresh() && isAuthenticated()) {
      output.info(
        'Your session is about to expire. Refreshing authentication...',
      );
      try {
        // Re-authenticate silently
        await auth.initiateLogin();
      } catch (error) {
        output.warning('Failed to refresh authentication. Please login again.');
      }
    }

    // Check if authenticated
    if (!isAuthenticated()) {
      output.error('Authentication required.');
      output.info("Please run 'todo auth login' to authenticate.");
      // We'll let the request proceed and fail with a 401
    }
  }

  // Add token to headers if available
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// API endpoints and methods
export const endpoints = {
  // Auth endpoints
  auth: {
    login: () => '/auth/cli-login-initiate',
    token: (deviceCode: string) => `/auth/cli-token?code=${deviceCode}`,
    verify: () => '/auth/verify',
  },

  // Project endpoints
  projects: {
    list: () => '/projects',
    get: (id: string) => `/projects/${id}`,
  },

  // Task endpoints
  tasks: {
    list: (projectId: string, params?: Record<string, string>) => {
      const queryParams = params
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      return `/projects/${projectId}/tasks${queryParams}`;
    },
    create: (projectId: string) => `/projects/${projectId}/tasks`,
    get: (taskId: string) => `/tasks/${taskId}`,
    update: (taskId: string) => `/tasks/${taskId}`,
    delete: (taskId: string) => `/tasks/${taskId}`,
  },
};

// Generic API request methods
export async function get<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function post<T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function put<T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function del<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// Error handling
function handleApiError(error: any): void {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;

      // Format error message based on status code
      switch (status) {
        case 400:
          output.error('Bad Request: The request was invalid.');
          if (data?.error) {
            output.info(`Details: ${data.error}`);
          }
          break;
        case 401:
          output.error('Authentication required.');
          output.info("Please run 'todo auth login' to authenticate.");
          break;
        case 403:
          output.error(
            "Access denied. You don't have permission for this action.",
          );
          break;
        case 404:
          output.error('Resource not found.');
          break;
        case 422:
          output.error('Validation error:');
          if (data?.errors) {
            Object.entries(data.errors).forEach(([field, message]) => {
              output.info(`  - ${field}: ${message}`);
            });
          } else if (data?.error) {
            output.info(`  - ${data.error}`);
          }
          break;
        case 429:
          output.error('Too many requests. Please try again later.');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          output.error('Server error. Please try again later.');
          break;
        default:
          output.error(`API Error: ${status} - ${error.response.statusText}`);
          if (data?.error) {
            output.info(`Details: ${data.error}`);
          }
      }
    } else if (error.request) {
      // The request was made but no response was received
      output.error('Network Error: No response received from server');
      output.info('Please check your internet connection.');
      output.info(`Current API URL: ${getApiUrl()}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      output.error(`Error: ${error.message}`);
    }
  } else {
    output.error(`Unexpected error: ${error?.message || error}`);
  }
}

export default api;
