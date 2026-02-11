import { apiClient, ApiResponse } from "./client";

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    access_token: string;
    expires_at: number;
  };
}

export interface RegisterRequest {
  name: string;
  company_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  type: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Storage keys
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const AUTH_EXPIRES_KEY = "auth_expires_at";

// Auth Service
export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>("/login", credentials);

    // Store token and user if login successful
    if (response.data?.success && response.data?.data && typeof window !== "undefined") {
      const { access_token, user, expires_at } = response.data.data;
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_EXPIRES_KEY, expires_at.toString());
    }

    return response;
  },

  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>("/register", data);
    // Register API doesn't return a token, user needs to login after registration
    return response;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_EXPIRES_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = typeof window !== "undefined"
      ? localStorage.getItem(AUTH_EXPIRES_KEY)
      : null;

    if (!token || !expiresAt) return false;

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    return now < parseInt(expiresAt, 10);
  },

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ApiResponse<ChangePasswordResponse>> {
    return apiClient.post<ChangePasswordResponse>("/change-password", data);
  },
};
