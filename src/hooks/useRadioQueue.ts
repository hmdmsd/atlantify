import { useState, useEffect } from "react";
import { ApiClient, apiConfig } from "../config/api.config";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  addedBy: string;
  addedAt: string;
}

interface QueueState {
  currentTrack: Track | null;
  queue: Track[];
  isLoading: boolean;
  error: string | null;
}

export const useRadioQueue = () => {
  const [state, setState] = useState<QueueState>({
    currentTrack: null,
    queue: [],
    isLoading: true,
    error: null,
  });

  const api = ApiClient.getInstance();

  useEffect(() => {
    fetchQueue();
    setupWebSocket();
  }, []);

  const fetchQueue = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = await api.get<{
        currentTrack: Track | null;
        queue: Track[];
      }>(apiConfig.endpoints.radio.queue);

      setState((prev) => ({
        ...prev,
        currentTrack: data.currentTrack,
        queue: data.queue,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to fetch queue",
        isLoading: false,
      }));
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(apiConfig.wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "QUEUE_UPDATE":
          setState((prev) => ({
            ...prev,
            queue: data.queue,
          }));
          break;

        case "TRACK_CHANGE":
          setState((prev) => ({
            ...prev,
            currentTrack: data.currentTrack,
          }));
          break;
      }
    };

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: "WebSocket connection failed",
      }));
    };

    return () => {
      ws.close();
    };
  };

  const addToQueue = async (trackId: string) => {
    try {
      await api.post(apiConfig.endpoints.radio.queue, { trackId });
      await fetchQueue();
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to add track to queue",
      }));
      return false;
    }
  };

  const skipTrack = async () => {
    try {
      await api.post(apiConfig.endpoints.radio.next);
      await fetchQueue();
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to skip track",
      }));
      return false;
    }
  };

  return {
    ...state,
    addToQueue,
    skipTrack,
    refreshQueue: fetchQueue,
  };
};
