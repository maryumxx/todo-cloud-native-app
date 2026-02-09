// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  position: number;
  due_date: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface EventUpdate {
  title?: string;
  description?: string | null;
  start_time?: string;
  end_time?: string;
}

// User profile types
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  notification_preferences: Record<string, boolean>;
  onboarding_completed: boolean;
  created_at: string;
}

export interface UserProfileUpdate {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  notification_preferences?: Record<string, boolean>;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
