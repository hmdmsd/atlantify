import React, { useState } from "react";
import {
  Wifi,
  WifiOff,
  Music2,
  Plus,
  SkipForward,
  Pause,
  Play,
  Power,
} from "lucide-react";
import { useRadioQueue } from "@/hooks/useRadioQueue";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { SongSearchModal } from "@/components/Modals/SongSearchModal";
import { QueueItem } from "@/components/RadioQueue/QueueItem";

export const RadioPage: React.FC = () => {
  const {
    queue,
    currentTrack,
    listeners,
    isConnected,
    isAdmin,
    isRadioActive,
    addToQueue,
    removeFromQueue,
    skipTrack,
    toggleRadioStatus,
  } = useRadioQueue();

  const { isPlaying, togglePlay } = useAudioPlayer();

  const [showSongSearchModal, setShowSongSearchModal] = useState(false);

  const handleAddToQueue = async (songId: string) => {
    try {
      await addToQueue(songId);
      setShowSongSearchModal(false);
    } catch (error) {
      console.error("Failed to add track to queue", error);
    }
  };

  const handleToggleRadio = async () => {
    try {
      await toggleRadioStatus();
    } catch (error) {
      console.error("Failed to toggle radio status", error);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Connection and Radio Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
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

        {/* Radio Toggle for Admin */}
        {isAdmin && (
          <button
            onClick={handleToggleRadio}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors
              ${
                isRadioActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }
            `}
          >
            <Power className="w-5 h-5" />
            {isRadioActive ? "Stop Radio" : "Start Radio"}
          </button>
        )}
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
      {currentTrack && isRadioActive && (
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
            {isAdmin && (
              <button
                onClick={skipTrack}
                className="p-2 text-neutral-400 hover:text-blue-500 rounded-full transition-colors"
                title="Skip Track"
              >
                <SkipForward size={24} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Queue Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Queue</h2>
        {isAdmin && (
          <button
            onClick={() => setShowSongSearchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Track
          </button>
        )}
      </div>

      {/* Queue List */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 divide-y divide-neutral-800">
        {queue.map((track, index) => (
          <QueueItem
            key={track.id}
            track={track}
            position={index + 1}
            isCurrentTrack={currentTrack?.id === track.id}
            onRemove={isAdmin ? () => removeFromQueue(track.id) : undefined}
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

export default RadioPage;
