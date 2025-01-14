import React, { useState, useEffect } from "react";
import { QueueItem } from "./QueueItem";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  addedBy: string;
  addedAt: string;
}

export const RadioQueue: React.FC = () => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
    setupWebSocket();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch("/api/radio/queue");
      if (!response.ok) throw new Error("Failed to fetch queue");

      const data = await response.json();
      setQueue(data.queue);
      setCurrentTrack(data.currentTrack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "QUEUE_UPDATE":
          setQueue(data.queue);
          break;
        case "TRACK_CHANGE":
          setCurrentTrack(data.currentTrack);
          break;
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
    };

    return () => {
      ws.close();
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Radio Queue</h2>
        <p className="text-gray-600">
          {queue.length} {queue.length === 1 ? "track" : "tracks"} in queue
        </p>
      </div>

      <div className="divide-y">
        {currentTrack && (
          <QueueItem track={currentTrack} isCurrentTrack={true} position={0} />
        )}

        {queue.map((track, index) => (
          <QueueItem
            key={track.id}
            track={track}
            isCurrentTrack={false}
            position={index + 1}
          />
        ))}

        {queue.length === 0 && !currentTrack && (
          <div className="p-8 text-center text-gray-500">
            The queue is empty. Add some tracks!
          </div>
        )}
      </div>
    </div>
  );
};
