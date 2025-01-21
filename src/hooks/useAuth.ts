import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth.service";
import {
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

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (state.isAuthenticated) {
      const refreshInterval = setInterval(async () => {
        try {
          await authService.refreshToken();
        } catch (error) {
          console.error("Token refresh failed:", error);
          logout();
        }
      }, 14 * 60 * 1000); // Refresh token every 14 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [state.isAuthenticated]);

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
      localStorage.removeItem("auth_token");
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

  // Getter for checking if the user is an admin
  const isAdmin = state.user?.role === "admin";

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    isAdmin, // Add isAdmin to the returned object
  };
};
