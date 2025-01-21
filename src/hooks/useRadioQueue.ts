import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { ApiClient, apiConfig } from "@/config/api.config";
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
  isRadioActive: boolean;
}

const api = ApiClient.getInstance();

export const useRadioQueue = () => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [listeners, setListeners] = useState(0);
  const [isRadioActive, setIsRadioActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSongs, setAvailableSongs] = useState<Track[]>([]);

  const { lastMessage, isConnected } = useWebSocket();
  const { isAdmin, user } = useAuth();

  // Fetch initial queue data
  const fetchQueueData = useCallback(async () => {
    try {
      const response = await api.get<QueueState>(
        apiConfig.endpoints.radio.queue
      );
      setQueue(response.queue);
      setCurrentTrack(response.currentTrack);
      setListeners(response.listeners);
      setIsRadioActive(response.isRadioActive);
      setError(null);
    } catch (err) {
      setError("Failed to load queue");
      console.error(err);
    }
  }, []);

  // Fetch available songs
  const fetchAvailableSongs = useCallback(async (searchTerm?: string) => {
    try {
      const endpoint = searchTerm
        ? `${apiConfig.endpoints.songs.list}?search=${encodeURIComponent(
            searchTerm
          )}`
        : apiConfig.endpoints.songs.list;

      const response = await api.get<{ success: boolean; songs: Track[] }>(
        endpoint
      );
      setAvailableSongs(response.songs);
    } catch (err) {
      setError("Failed to fetch available songs");
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
        case "RADIO_STATUS_CHANGE":
          setIsRadioActive(lastMessage.data.isRadioActive);
          break;
      }
    }
  }, [lastMessage]);

  // Initial data fetch
  useEffect(() => {
    fetchQueueData();
    fetchAvailableSongs();
  }, [fetchQueueData, fetchAvailableSongs]);

  // Queue management methods
  const addToQueue = useCallback(
    async (songId: string) => {
      // Only allow admins to add to queue
      if (!isAdmin) {
        throw new Error("Only admins can add tracks to the queue");
      }

      try {
        await api.post(apiConfig.endpoints.radio.addToQueue, { songId });
        setError(null);
      } catch (err) {
        setError("Failed to add track to queue");
        throw err;
      }
    },
    [isAdmin]
  );

  const removeFromQueue = useCallback(
    async (queueId: string) => {
      // Only allow admins to remove from queue
      if (!isAdmin) {
        throw new Error("Only admins can remove tracks from the queue");
      }

      try {
        await api.delete(apiConfig.endpoints.radio.removeFromQueue(queueId));
        setError(null);
      } catch (err) {
        setError("Failed to remove track from queue");
        throw err;
      }
    },
    [isAdmin]
  );

  const skipTrack = useCallback(async () => {
    // Only allow admins to skip tracks
    if (!isAdmin) {
      throw new Error("Only admins can skip tracks");
    }

    try {
      await api.post(apiConfig.endpoints.radio.skip);
      setError(null);
    } catch (err) {
      setError("Failed to skip track");
      throw err;
    }
  }, [isAdmin]);

  // Toggle radio status
  const toggleRadioStatus = useCallback(async () => {
    // Only allow admins to toggle radio
    if (!isAdmin) {
      throw new Error("Only admins can toggle radio status");
    }

    try {
      const response = await api.post(apiConfig.endpoints.radio.toggle);
      setIsRadioActive(response.isRadioActive);
      setError(null);
      return response.isRadioActive;
    } catch (err) {
      setError("Failed to toggle radio status");
      throw err;
    }
  }, [isAdmin]);

  return {
    queue,
    currentTrack,
    listeners,
    isRadioActive,
    error,
    isConnected,
    isAdmin,
    availableSongs,
    addToQueue,
    removeFromQueue,
    skipTrack,
    toggleRadioStatus,
    fetchAvailableSongs,
    refetch: fetchQueueData,
  };
};
