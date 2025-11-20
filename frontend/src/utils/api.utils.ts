import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '@/constants/defaults.constants';
import { ERROR_MESSAGES } from '@/constants/app.constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_CONFIG.DEFAULT_BASE_URL;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns { success: true, data: {...} }
    // Extract and return just the data field
    if (response.data && response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    // Fallback to response.data for other cases
    return response.data;
  },
  (error: AxiosError<{ error?: { message?: string }; message?: string; success?: boolean }>) => {
    // Backend sends errors as { success: false, error: { message: "..." } }
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      ERROR_MESSAGES.API_ERROR;

    const customError = new ApiError(
      errorMessage,
      error.response?.status || 500,
      error.response?.data
    );

    // Handle 401 - redirect to login if needed
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Optional: trigger logout action or redirect
    }

    return Promise.reject(customError);
  }
);

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  token?: string;
  data?: unknown;
  params?: Record<string, unknown>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, body, ...rest } = options;

  const config: Record<string, unknown> = {
    url: endpoint,
    ...rest,
  };

  // Convert body to data for axios
  if (body) {
    config.data = JSON.parse(body);
  }

  // Override token if provided
  if (token) {
    config.headers = {
      ...(config.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    };
  }

  return apiClient.request<unknown, T>(config);
}

export default apiClient;
