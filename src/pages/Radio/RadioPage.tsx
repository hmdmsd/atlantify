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
} from "lucide-react";
import { QueueItem } from "@/components/RadioQueue/QueueItem";
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

  const { isPlaying, togglePlay } = useAudioPlayer();

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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Connection Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Wifi className="text-blue-500 w-6 h-6" />
          ) : (
            <WifiOff className="text-red-500 w-6 h-6" />
          )}
          <span className="text-sm text-neutral-400">
            {isConnected ? "Online" : "Disconnected"}
          </span>
        </div>
        <div className="text-sm text-neutral-400">{listeners} listeners</div>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Music2 className="text-blue-500 w-8 h-8" />
          Radio Station
        </h1>
        <p className="text-neutral-400">
          Listen to live music, skip tracks, and manage the queue.
        </p>
      </div>

      {/* Current Track Section */}
      {currentTrack && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {currentTrack.title}
                </h3>
                <p className="text-neutral-400">{currentTrack.artist}</p>
              </div>
            </div>
            <button
              onClick={skipTrack}
              className="p-2 text-neutral-400 hover:text-blue-500 rounded-full transition-colors"
              title="Skip Track"
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Queue Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Queue</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        >
          <Plus size={20} />
          Add Track
        </button>
      </div>

      {/* Queue List */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 divide-y divide-neutral-800">
        {queue.map((track, index) => (
          <QueueItem
            key={track.id}
            track={track}
            position={index + 1}
            isCurrentTrack={currentTrack?.id === track.id}
          />
        ))}

        {queue.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            <Music2
              size={48}
              className="mb-4 mx-auto text-blue-500 opacity-50"
            />
            <p>No tracks in the queue. Add some to get started!</p>
          </div>
        )}
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Modal */}
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
