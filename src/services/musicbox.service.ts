import { ApiClient } from "@/config/api.config";
import {
  SuggestionFilters,
  SuggestionResponse,
  SuggestionsListResponse,
  Suggestion,
} from "@/types/suggestion.types";

const apiClient = ApiClient.getInstance();

export const musicBoxService = {
  async getSuggestions(filters: SuggestionFilters) {
    return apiClient.get<SuggestionsListResponse>(
      `/musicbox/suggestions${this.buildQueryString(filters)}`
    );
  },

  async createSuggestion(data: {
    title: string;
    artist: string;
  }): Promise<SuggestionResponse> {
    console.log("=== Starting createSuggestion ===");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("You must be logged in to suggest songs");
    }

    try {
      console.log("1. Sending POST request with data:", data);
      const response = await apiClient.post<SuggestionResponse>(
        "/musicbox/suggestions",
        data
      );
      console.log("2. Raw response from API:", response);

      // Handle successful creation
      if (response.success && response.suggestion) {
        console.log("3. Success case - valid suggestion:", response.suggestion);
        return {
          success: true,
          suggestion: response.suggestion,
          message: "Suggestion created successfully",
        };
      }

      // Handle existing suggestion case
      if (response.existingSuggestion) {
        console.log(
          "3. Duplicate case - existing suggestion found:",
          response.existingSuggestion
        );
        return {
          success: false,
          message: "This song has already been suggested.",
          existingSuggestion: response.existingSuggestion,
        };
      }

      console.log("3. Unexpected response format:", response);
      throw new Error(response.message || "Failed to create suggestion");
    } catch (error) {
      console.error("4. Error in createSuggestion:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to create suggestion");
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

  async updateSuggestionStatus(
    suggestionId: string,
    status: "approved" | "rejected"
  ) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("You must be logged in to update suggestion status");
    }

    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        suggestion: Suggestion;
      }>(`/musicbox/suggestions/${suggestionId}/status`, { status });

      if (!response.success) {
        throw new Error(
          response.message || "Failed to update suggestion status"
        );
      }

      return response;
    } catch (error) {
      console.error("Status update error:", error);
      throw error;
    }
  },

  async removeSuggestion(suggestionId: string) {
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete suggestion");
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
