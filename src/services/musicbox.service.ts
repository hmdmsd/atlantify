import { ApiClient } from "@/config/api.config";
import {
  SuggestionFilters,
  SuggestionResponse,
  SuggestionsListResponse,
} from "@/types/suggestion.types";

const apiClient = ApiClient.getInstance();

export const musicBoxService = {
  async getSuggestions(filters: SuggestionFilters) {
    return apiClient.get<SuggestionsListResponse>(
      `/musicbox/suggestions${this.buildQueryString(filters)}`
    );
  },

  async createSuggestion(data: { title: string; artist: string }) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("You must be logged in to suggest songs");
    }

    try {
      const response = await apiClient.post<SuggestionResponse>(
        "/musicbox/suggestions",
        data
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to create suggestion");
      }
      return response;
    } catch (error) {
      console.error("Create suggestion error:", error);
      throw error;
    }
  },

  async toggleVote(suggestionId: string) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("You must be logged in to vote");
    }

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        hasVoted: boolean;
      }>(`/musicbox/suggestions/${suggestionId}/toggle-vote`);

      if (!response.success) {
        throw new Error(response.message || "Failed to toggle vote");
      }

      return response;
    } catch (error) {
      console.error("Vote toggle error:", error);
      throw error;
    }
  },

  async deleteSuggestion(suggestionId: string) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("You must be logged in to delete suggestions");
    }

    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/musicbox/suggestions/${suggestionId}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete suggestion");
      }

      return response;
    } catch (error) {
      console.error("Delete suggestion error:", error);
      throw error;
    }
  },

  buildQueryString(filters: SuggestionFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  },
};
