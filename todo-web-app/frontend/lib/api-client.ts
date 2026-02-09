import { Task, TaskUpdate, ApiResponse, AuthResponse, Event, EventCreate, EventUpdate, UserProfile, UserProfileUpdate } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

/**
 * Error types for better error categorization and handling
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  message: string;
  type: ApiErrorType;
  statusCode?: number;
}

// Event emitter for retry notifications
type RetryListener = (attempt: number, maxRetries: number) => void;
const retryListeners: Set<RetryListener> = new Set();

export function onRetry(listener: RetryListener): () => void {
  retryListeners.add(listener);
  return () => retryListeners.delete(listener);
}

function notifyRetry(attempt: number, maxRetries: number): void {
  retryListeners.forEach((listener) => listener(attempt, maxRetries));
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private setAuthTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
  }

  private clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * Determines if the error is retryable
   */
  private isRetryableError(error: ApiError): boolean {
    return (
      error.type === ApiErrorType.NETWORK_ERROR ||
      error.type === ApiErrorType.TIMEOUT_ERROR ||
      error.type === ApiErrorType.SERVER_ERROR
    );
  }

  /**
   * Determines the type of network error based on the error message
   */
  private categorizeNetworkError(error: Error): ApiError {
    const message = error.message.toLowerCase();

    // Timeout errors
    if (message.includes('timeout') || message.includes('aborted') || error.name === 'AbortError') {
      return {
        message: 'Request timed out. Please check your connection and try again.',
        type: ApiErrorType.TIMEOUT_ERROR,
      };
    }

    // Connection refused - backend server not running
    if (message.includes('failed to fetch') || message.includes('network') || message.includes('connection')) {
      return {
        message: 'Unable to connect to the server. Please ensure the backend is running on ' + API_BASE_URL,
        type: ApiErrorType.NETWORK_ERROR,
      };
    }

    // CORS errors
    if (message.includes('cors')) {
      return {
        message: 'Cross-origin request blocked. Please check server CORS configuration.',
        type: ApiErrorType.NETWORK_ERROR,
      };
    }

    return {
      message: 'A network error occurred. Please check your connection.',
      type: ApiErrorType.NETWORK_ERROR,
    };
  }

  /**
   * Categorizes HTTP error responses
   */
  private categorizeHttpError(status: number, detail?: string): ApiError {
    if (status === 401) {
      return {
        message: detail || 'Authentication required. Please log in.',
        type: ApiErrorType.AUTH_ERROR,
        statusCode: status,
      };
    }

    if (status === 403) {
      return {
        message: detail || 'You do not have permission to perform this action.',
        type: ApiErrorType.AUTH_ERROR,
        statusCode: status,
      };
    }

    if (status === 422 || status === 400) {
      return {
        message: detail || 'Invalid input. Please check your data and try again.',
        type: ApiErrorType.VALIDATION_ERROR,
        statusCode: status,
      };
    }

    if (status >= 500) {
      return {
        message: detail || 'Server error. Please try again later.',
        type: ApiErrorType.SERVER_ERROR,
        statusCode: status,
      };
    }

    return {
      message: detail || `Request failed with status ${status}`,
      type: ApiErrorType.UNKNOWN_ERROR,
      statusCode: status,
    };
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make a single request with timeout
   */
  private async singleRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<{ data?: T; error?: ApiError }> {
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError = this.categorizeHttpError(response.status, errorData.detail);
        return { error: apiError };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        const apiError = this.categorizeNetworkError(error);
        return { error: apiError };
      }
      return {
        error: {
          message: 'An unexpected error occurred',
          type: ApiErrorType.UNKNOWN_ERROR,
        },
      };
    }
  }

  /**
   * Make a request with automatic retry on failure
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    enableRetry: boolean = true
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= (enableRetry ? MAX_RETRIES : 0); attempt++) {
      if (attempt > 0) {
        const delay = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        notifyRetry(attempt, MAX_RETRIES);
        await this.sleep(delay);
      }

      const result = await this.singleRequest<T>(endpoint, options);

      if (result.data) {
        return { data: result.data };
      }

      if (result.error) {
        lastError = result.error;

        // Don't retry on non-retryable errors
        if (!this.isRetryableError(result.error)) {
          return { error: result.error.message };
        }
      }
    }

    return { error: lastError?.message || 'Request failed after multiple retries' };
  }

  // Auth methods (no retry on auth requests)
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false // Disable retry for auth
    );

    if (response.data) {
      this.setAuthTokens(response.data.access_token, response.data.refresh_token);
    }

    return response;
  }

  async register(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false // Disable retry for auth
    );

    if (response.data) {
      this.setAuthTokens(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>(
      '/api/auth/logout',
      { method: 'POST' },
      false
    );
    this.clearAuthTokens();
    return response;
  }

  // Task methods
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/api/tasks/');
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${taskId}`);
  }

  async createTask(title: string, description?: string): Promise<ApiResponse<Task>> {
    return this.request<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async updateTask(taskId: string, taskData: TaskUpdate): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async reorderTasks(taskIds: string[]): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/tasks/reorder', {
      method: 'POST',
      body: JSON.stringify({ task_ids: taskIds }),
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Event methods
  async getEvents(startDate?: string, endDate?: string): Promise<ApiResponse<Event[]>> {
    let endpoint = '/api/events/';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.request<Event[]>(endpoint);
  }

  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/api/events/${eventId}`);
  }

  async createEvent(eventData: EventCreate): Promise<ApiResponse<Event>> {
    return this.request<Event>('/api/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: EventUpdate): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // User profile methods
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/users/profile');
  }

  async updateProfile(profileData: UserProfileUpdate): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async completeOnboarding(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/users/onboarding', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
