import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { radioService } from "../services/radio.service";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  addedBy: {
    id: string;
    username: string;
  };
  addedAt: string;
}

interface RadioState {
  currentTrack: Track | null;
  queue: Track[];
  listeners: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: RadioState = {
  currentTrack: null,
  queue: [],
  listeners: 0,
  isLoading: false,
  error: null,
};

export const fetchQueue = createAsyncThunk("radio/fetchQueue", async () => {
  const queueState = await radioService.getCurrentQueue();
  return queueState;
});

export const addToQueue = createAsyncThunk(
  "radio/addToQueue",
  async (trackId: string) => {
    await radioService.addToQueue(trackId);
    const queueState = await radioService.getCurrentQueue();
    return queueState;
  }
);

export const skipTrack = createAsyncThunk("radio/skipTrack", async () => {
  await radioService.skipTrack();
  const queueState = await radioService.getCurrentQueue();
  return queueState;
});

const radioSlice = createSlice({
  name: "radio",
  initialState,
  reducers: {
    updateCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
    },
    updateQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
    },
    updateListeners: (state, action: PayloadAction<number>) => {
      state.listeners = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Queue
      .addCase(fetchQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrack = action.payload.currentTrack;
        state.queue = action.payload.queue;
        state.listeners = action.payload.listeners;
      })
      .addCase(fetchQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch queue";
      })
      // Add to Queue
      .addCase(addToQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrack = action.payload.currentTrack;
        state.queue = action.payload.queue;
      })
      .addCase(addToQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to add track to queue";
      })
      // Skip Track
      .addCase(skipTrack.fulfilled, (state, action) => {
        state.currentTrack = action.payload.currentTrack;
        state.queue = action.payload.queue;
      });
  },
});

export const { updateCurrentTrack, updateQueue, updateListeners, clearError } =
  radioSlice.actions;
export default radioSlice.reducer;
