import { ApiClient } from "../config/api.config";

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ResetPasswordData {
  email: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

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
      const response = await this.api.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      this.setToken(response.token);
      return response.user;
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
      this.setToken(response.token);
      return response.user;
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
    if (!this.getToken()) {
      return null;
    }

    try {
      const user = await this.api.get<User>("/auth/me");
      return user;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  public async forgotPassword(data: ResetPasswordData): Promise<void> {
    try {
      await this.api.post("/auth/forgot-password", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    try {
      await this.api.post("/auth/reset-password", { token, password });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await this.api.post("/auth/change-password", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async refreshToken(): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("No refresh token available");
      }

      const response = await this.api.post<{ token: string }>("/auth/refresh");
      this.setToken(response.token);
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
