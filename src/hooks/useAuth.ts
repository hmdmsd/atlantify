import { useState, useEffect } from "react";
import { ApiClient, apiConfig } from "../config/api.config";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  email: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const api = ApiClient.getInstance();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const user = await api.get<User>("/auth/me");
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem("auth_token");
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Authentication failed",
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.post<{ token: string; user: User }>(
        apiConfig.endpoints.auth.login,
        credentials
      );

      localStorage.setItem("auth_token", response.token);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Login failed",
      }));
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await api.post(apiConfig.endpoints.auth.register, credentials);
      return await login({
        username: credentials.username,
        password: credentials.password,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Registration failed",
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
};
