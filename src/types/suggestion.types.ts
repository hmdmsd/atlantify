// src/types/suggestion.types.ts

export interface User {
  id: string;
  username: string;
  role: "user" | "admin";
}

export interface Vote {
  suggestionId: string;
  userId: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  voteCount: number; // Added to match backend
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  suggestedByUser?: {
    // Added to include user details
    id: string;
    username: string;
  };
  userVotes?: Vote[]; // Added to track user votes
}

export interface SuggestionFilters {
  status?: "pending" | "approved" | "rejected";
  sort?: "newest" | "popular";
  search?: string;
  page?: number;
  limit?: number;
  userId?: string; // Added to filter by user
}

export interface SuggestionResponse {
  success: boolean;
  suggestion?: Suggestion;
  message?: string;
  error?: string;
  statusCode?: number;
  existingSuggestion?: Suggestion;
}

export interface SuggestionsListResponse {
  success: boolean;
  suggestions: Suggestion[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CreateSuggestionData {
  title: string;
  artist: string;
}

export interface UpdateSuggestionStatusData {
  status: "approved" | "rejected";
}

// Response types for specific actions
export interface ToggleVoteResponse {
  success: boolean;
  message: string;
  hasVoted: boolean;
}

export interface DeleteSuggestionResponse {
  success: boolean;
  message: string;
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  suggestion: Suggestion;
}

// Error types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

// Utility types for request parameters
export type SortType = "newest" | "popular";
export type StatusType = "pending" | "approved" | "rejected";

// Constants
export const SUGGESTION_STATUS = {
  PENDING: "pending" as const,
  APPROVED: "approved" as const,
  REJECTED: "rejected" as const,
};

export const SORT_TYPES = {
  NEWEST: "newest" as const,
  POPULAR: "popular" as const,
};
