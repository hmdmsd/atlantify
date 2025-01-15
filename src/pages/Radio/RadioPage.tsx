// src/pages/Radio/RadioPage.tsx
import React, { useState, useCallback } from "react";
import { useRadioQueue } from "../../hooks/useRadioQueue";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import {
  Plus,
  SkipForward,
  Music2,
  Wifi,
  WifiOff,
  Pause,
  Play,
} from "lucide-react"; // Import Pause and Play
import { QueueItem } from "@/components/RadioQueue/QueueItem";
import { AudioPlayer } from "@/components/AudioPlayer/AudioPlayer";
import { SongUploadModal } from "@/components/Modals/SongUploadModal";

export const RadioPage: React.FC = () => {
  const {
    queue,
    currentTrack,
    addToQueue,
    skipTrack,
    error,
    listeners,
    isConnected,
  } = useRadioQueue();

  const { isPlaying, togglePlay, currentTime, duration, seek } =
    useAudioPlayer();

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleAddTrack = useCallback(
    async (songId: string) => {
      try {
        await addToQueue(songId);
        setShowUploadModal(false);
      } catch (err) {
        console.error("Failed to add track", err);
      }
    },
    [addToQueue]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Connection Status */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="text-green-500" />
          ) : (
            <WifiOff className="text-red-500" />
          )}
          <span className="text-sm">
            {isConnected ? "Online" : "Disconnected"}
          </span>
        </div>
        <div className="text-sm text-gray-600">{listeners} listeners</div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Radio Station</h1>
        <p className="text-gray-600">
          Listen to live music, skip tracks, and manage the queue.
        </p>
      </div>

      {currentTrack && (
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{currentTrack.title}</h3>
              <p className="text-gray-600">{currentTrack.artist}</p>
            </div>
            <button
              onClick={skipTrack}
              className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"
              title="Skip Track"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <AudioPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            onPlayPause={togglePlay}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Queue</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Track
        </button>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {queue.map((track, index) => (
          <QueueItem
            key={track.id}
            track={track}
            position={index + 1}
            isCurrentTrack={currentTrack?.id === track.id}
          />
        ))}

        {queue.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Music2 size={48} className="mb-4 opacity-50" />
            <p>No tracks in the queue. Add some to get started!</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {showUploadModal && (
        <SongUploadModal
          onClose={() => setShowUploadModal(false)}
          onAddTrack={handleAddTrack}
        />
      )}
    </div>
  );
};

export default RadioPage;
