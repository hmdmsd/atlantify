// src/hooks/useRadioQueue.ts
import { useState, useEffect, useCallback } from "react";
import { ApiClient, apiConfig } from "../config/api.config";
import { useWebSocket } from "./useWebSocket";

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

interface QueueState {
  currentTrack: Track | null;
  queue: Track[];
  listeners: number;
}

const api = ApiClient.getInstance();

export const useRadioQueue = () => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [listeners, setListeners] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage, isConnected } = useWebSocket();

  // Fetch initial queue data
  const fetchQueueData = useCallback(async () => {
    try {
      const response = await api.get<QueueState>(
        apiConfig.endpoints.radio.queue
      );
      setQueue(response.queue);
      setCurrentTrack(response.currentTrack);
      setListeners(response.listeners);
      setError(null);
    } catch (err) {
      setError("Failed to load queue");
      console.error(err);
    }
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case "QUEUE_UPDATE":
          setQueue(lastMessage.data.queue);
          break;
        case "TRACK_CHANGE":
          setCurrentTrack(lastMessage.data.currentTrack);
          break;
        case "LISTENERS_UPDATE":
          setListeners(lastMessage.data.listeners);
          break;
      }
    }
  }, [lastMessage]);

  // Initial data fetch
  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  // Queue management methods
  const addToQueue = useCallback(async (songId: string) => {
    try {
      await api.post(apiConfig.endpoints.radio.addToQueue, { songId });
      setError(null);
    } catch (err) {
      setError("Failed to add track to queue");
      throw err;
    }
  }, []);

  const removeFromQueue = useCallback(async (queueId: string) => {
    try {
      await api.delete(`${apiConfig.endpoints.radio.removeFromQueue(queueId)}`);
      setError(null);
    } catch (err) {
      setError("Failed to remove track from queue");
      throw err;
    }
  }, []);

  const skipTrack = useCallback(async () => {
    try {
      await api.post(apiConfig.endpoints.radio.skip);
      setError(null);
    } catch (err) {
      setError("Failed to skip track");
      throw err;
    }
  }, []);

  return {
    queue,
    currentTrack,
    listeners,
    error,
    isConnected,
    addToQueue,
    removeFromQueue,
    skipTrack,
    refetch: fetchQueueData,
  };
};
