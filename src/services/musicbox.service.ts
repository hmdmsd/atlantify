import { ApiClient } from "../config/api.config";
import { EventEmitter } from "events";

interface Suggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: {
    id: string;
    username: string;
  };
  votes: number;
  hasVoted: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface CreateSuggestionDto {
  title: string;
  artist: string;
}

interface SuggestionFilters {
  status?: "pending" | "approved" | "rejected";
  sort?: "newest" | "popular";
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

class MusicBoxService extends EventEmitter {
  private static instance: MusicBoxService;
  private api: ApiClient;
  private suggestions: Map<string, Suggestion> = new Map();

  private constructor() {
    super();
    this.api = ApiClient.getInstance();
    this.setupWebSocket();
  }

  public static getInstance(): MusicBoxService {
    if (!MusicBoxService.instance) {
      MusicBoxService.instance = new MusicBoxService();
    }
    return MusicBoxService.instance;
  }

  private setupWebSocket(): void {
    const ws = new WebSocket(process.env.VITE_WS_URL || "ws://localhost:3000");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "SUGGESTION_UPDATE") {
          this.handleSuggestionUpdate(data.suggestion);
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit("connectionError", "Failed to connect to MusicBox updates");
    };
  }

  private handleSuggestionUpdate(suggestion: Suggestion): void {
    this.suggestions.set(suggestion.id, suggestion);
    this.emit("suggestionUpdate", suggestion);
  }

  public async getSuggestions(
    filters: SuggestionFilters = {}
  ): Promise<PaginatedResponse<Suggestion>> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.search) queryParams.append("search", filters.search);

      const response = await this.api.get<PaginatedResponse<Suggestion>>(
        `/musicbox/suggestions?${queryParams.toString()}`
      );

      // Update local cache
      response.items.forEach((suggestion) => {
        this.suggestions.set(suggestion.id, suggestion);
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async createSuggestion(
    data: CreateSuggestionDto
  ): Promise<Suggestion> {
    try {
      const suggestion = await this.api.post<Suggestion>(
        "/musicbox/suggestions",
        data
      );
      this.suggestions.set(suggestion.id, suggestion);
      return suggestion;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async voteSuggestion(id: string): Promise<Suggestion> {
    try {
      const suggestion = await this.api.post<Suggestion>(
        `/musicbox/suggestions/${id}/vote`
      );
      this.suggestions.set(suggestion.id, suggestion);
      return suggestion;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async removeSuggestion(id: string): Promise<void> {
    try {
      await this.api.delete(`/musicbox/suggestions/${id}`);
      this.suggestions.delete(id);
      this.emit("suggestionRemoved", id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getMySuggestions(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Suggestion>> {
    try {
      return await this.api.get<PaginatedResponse<Suggestion>>(
        `/musicbox/suggestions/my?page=${page}&limit=${limit}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getPopularSuggestions(limit = 5): Promise<Suggestion[]> {
    try {
      return await this.api.get<Suggestion[]>(
        `/musicbox/suggestions/popular?limit=${limit}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getRecentSuggestions(limit = 5): Promise<Suggestion[]> {
    try {
      return await this.api.get<Suggestion[]>(
        `/musicbox/suggestions/recent?limit=${limit}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public getSuggestion(id: string): Suggestion | undefined {
    return this.suggestions.get(id);
  }

  public onSuggestionUpdate(callback: (suggestion: Suggestion) => void): void {
    this.on("suggestionUpdate", callback);
  }

  public onSuggestionRemoved(callback: (id: string) => void): void {
    this.on("suggestionRemoved", callback);
  }

  public offSuggestionUpdate(callback: (suggestion: Suggestion) => void): void {
    this.off("suggestionUpdate", callback);
  }

  public offSuggestionRemoved(callback: (id: string) => void): void {
    this.off("suggestionRemoved", callback);
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "string") {
      return new Error(error);
    }

    return new Error("An unknown error occurred in musicbox service");
  }

  // Analytics methods
  public async getSuggestionStats(): Promise<{
    totalSuggestions: number;
    approvedSuggestions: number;
    totalVotes: number;
    averageVotesPerSuggestion: number;
  }> {
    try {
      return await this.api.get("/musicbox/stats");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getMostActiveUsers(limit = 5): Promise<
    {
      userId: string;
      username: string;
      suggestionCount: number;
      voteCount: number;
    }[]
  > {
    try {
      return await this.api.get(`/musicbox/stats/active-users?limit=${limit}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const musicBoxService = MusicBoxService.getInstance();
