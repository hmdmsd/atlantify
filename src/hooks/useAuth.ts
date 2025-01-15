import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
} from "../types/auth.types";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();

    const refreshInterval = setInterval(() => {
      if (state.isAuthenticated) {
        authService.refreshToken().catch(() => {
          logout();
        });
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated]);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.login(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      return false;
    }
  };

  const register = async (
    credentials: RegisterCredentials
  ): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.register(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
  };
};
