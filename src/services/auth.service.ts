import { ApiClient } from "../config/api.config";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth.types";

class AuthService {
  private static instance: AuthService;
  private api: ApiClient;
  private tokenKey = "auth_token";

  private constructor() {
    this.api = ApiClient.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await this.api.post<AuthResponse>("/auth/login", {
        username: credentials.email,
        password: credentials.password,
      });

      if (!response.success || !response.token) {
        throw new Error("Login failed");
      }

      // Store the actual token string
      this.setToken(response.token.token);

      return response.token.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await this.api.post<AuthResponse>(
        "/auth/register",
        credentials
      );

      if (!response.success) {
        throw new Error("Registration failed");
      }

      return await this.login({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.api.post("/auth/logout");
    } finally {
      this.removeToken();
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await this.api.get<{ success: boolean; user: User }>(
        "/auth/me"
      );
      return response.success ? response.user : null;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  public async refreshToken(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await this.api.post<AuthResponse>("/auth/refresh", {
        token,
      });
      if (response.success && response.token) {
        this.setToken(response.token.token);
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      this.removeToken();
      throw this.handleError(error);
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === "string") {
      return new Error(error);
    }
    return new Error("An unknown error occurred");
  }
}

export const authService = AuthService.getInstance();
