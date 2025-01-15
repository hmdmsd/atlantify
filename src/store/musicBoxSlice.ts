import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { musicBoxService } from "../services/musicbox.service";

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
}

interface MusicBoxState {
  suggestions: Suggestion[];
  totalSuggestions: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    sort: string;
    search: string;
  };
}

const initialState: MusicBoxState = {
  suggestions: [],
  totalSuggestions: 0,
  isLoading: false,
  error: null,
  filters: {
    status: "all",
    sort: "newest",
    search: "",
  },
};

export const fetchSuggestions = createAsyncThunk(
  "musicBox/fetchSuggestions",
  async (filters: {
    status?: string;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await musicBoxService.getSuggestions(filters);
    return response;
  }
);

export const createSuggestion = createAsyncThunk(
  "musicBox/createSuggestion",
  async (data: { title: string; artist: string }) => {
    const suggestion = await musicBoxService.createSuggestion(data);
    return suggestion;
  }
);

export const voteSuggestion = createAsyncThunk(
  "musicBox/voteSuggestion",
  async (suggestionId: string) => {
    const suggestion = await musicBoxService.voteSuggestion(suggestionId);
    return suggestion;
  }
);

const musicBoxSlice = createSlice({
  name: "musicBox",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.filters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSuggestion: (state, action: PayloadAction<Suggestion>) => {
      const index = state.suggestions.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.suggestions[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Suggestions
      .addCase(fetchSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions = action.payload.items;
        state.totalSuggestions = action.payload.total;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch suggestions";
      })
      // Create Suggestion
      .addCase(createSuggestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSuggestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions.unshift(action.payload);
        state.totalSuggestions += 1;
      })
      .addCase(createSuggestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create suggestion";
      })
      // Vote Suggestion
      .addCase(voteSuggestion.fulfilled, (state, action) => {
        const index = state.suggestions.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.suggestions[index] = action.payload;
        }
      });
  },
});

export const { setFilters, clearError, updateSuggestion } =
  musicBoxSlice.actions;
export default musicBoxSlice.reducer;
