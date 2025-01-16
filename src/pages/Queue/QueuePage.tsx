import React, { useState, useEffect, useCallback } from "react";
import { ApiClient, apiConfig } from "@/config/api.config";
import { QueueItem } from "@/components/RadioQueue/QueueItem";
import { Wifi, WifiOff, SkipForward, Music2, Pause, Play } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer/AudioPlayer";
import { SongSearchModal } from "@/components/Modals/SongSearchModal";

interface Track {
  id: string;
  title: string;
  artist: string;
  path: string;
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

export const QueuePage: React.FC = () => {
  const [queueState, setQueueState] = useState<QueueState>({
    currentTrack: null,
    queue: [],
    listeners: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSongSearchModal, setShowSongSearchModal] = useState(false);

  const apiClient = ApiClient.getInstance();

  const fetchQueue = useCallback(async () => {
    try {
      const response = await apiClient.get<QueueState>(
        apiConfig.endpoints.radio.queue
      );
      setQueueState(response);
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleAddToQueue = useCallback(
    async (songId: string) => {
      try {
        await apiClient.post(apiConfig.endpoints.radio.addToQueue, { songId });
        await fetchQueue();
        setShowSongSearchModal(false);
      } catch (error) {
        console.error("Error adding to queue:", error);
      }
    },
    [apiClient, fetchQueue]
  );

  const handleSkipTrack = async () => {
    try {
      await apiClient.post(apiConfig.endpoints.radio.skip);
      await fetchQueue();
    } catch (error) {
      console.error("Error skipping track:", error);
    }
  };

  const handlePlay = () => {
    setIsPlaying((prevState) => !prevState);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg h-full">
      {/* Connection Status */}
      <div className="p-2 bg-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {queueState.listeners > 0 ? (
            <Wifi className="text-green-500" />
          ) : (
            <WifiOff className="text-red-500" />
          )}
          <span className="text-sm">
            {queueState.listeners > 0 ? "Online" : "Disconnected"}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {queueState.listeners} listeners
        </div>
      </div>

      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Radio Station</h2>
            <p className="text-gray-600">
              {queueState.queue.length} tracks in queue
            </p>
          </div>
          <button
            onClick={() => setShowSongSearchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Music2 size={20} />
            Add Track
          </button>
        </div>
      </div>

      {/* Current Track Player */}
      {queueState.currentTrack && (
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handlePlay}
              className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {queueState.currentTrack.title}
              </h3>
              <p className="text-gray-600">{queueState.currentTrack.artist}</p>
            </div>
            <button
              onClick={handleSkipTrack}
              className="p-2 rounded-full hover:bg-blue-100"
              title="Skip Track"
            >
              <SkipForward size={20} />
            </button>
          </div>
          <AudioPlayer
            currentTrack={queueState.currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={queueState.currentTrack.duration}
            onSeek={handleSeek}
            onPlayPause={handlePlay}
          />
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {queueState.queue.map((track, index) => (
          <QueueItem
            key={track.id}
            track={track}
            position={index + 1}
            isCurrentTrack={queueState.currentTrack?.id === track.id}
          />
        ))}

        {queueState.queue.length === 0 && !queueState.currentTrack && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Music2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg">The queue is empty</p>
            <p className="text-sm">Add some tracks to get started!</p>
          </div>
        )}
      </div>

      {/* Song Search Modal */}
      {showSongSearchModal && (
        <SongSearchModal
          onClose={() => setShowSongSearchModal(false)}
          onAddToQueue={handleAddToQueue}
        />
      )}
    </div>
  );
};
