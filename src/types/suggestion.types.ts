export interface Suggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionFilters {
  status?: "pending" | "approved" | "rejected";
  sort?: "newest" | "popular";
  search?: string;
  page?: number;
  limit?: number;
}

export interface SuggestionResponse {
  success: boolean;
  suggestion?: Suggestion;
  message?: string;
  error?: string;
  statusCode?: number; 
  existingSuggestion?: Suggestion; // Added for duplicate suggestion responses
}

export interface SuggestionsListResponse {
  success: boolean;
  suggestions: Suggestion[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}