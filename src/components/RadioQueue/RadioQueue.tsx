import React, { useState, useCallback } from "react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useRadioQueue } from "../../hooks/useRadioQueue";
import { QueueItem } from "./QueueItem";
import { AudioPlayer } from "../AudioPlayer/AudioPlayer";
import { Play, Pause, SkipForward, Music2, Wifi, WifiOff } from "lucide-react";
import { SongUploadModal } from "@/components/Modals/SongUploadModal";

export const RadioQueue: React.FC = () => {
  const {
    queue,
    currentTrack,
    error,
    addToQueue,
    skipTrack,
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
    <div className="flex flex-col bg-white rounded-lg shadow-lg h-full">
      {/* Connection Status */}
      <div className="p-2 bg-gray-100 flex items-center justify-between">
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

      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Radio Station</h2>
            <p className="text-gray-600">{queue.length} tracks in queue</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Music2 size={20} />
            Add Track
          </button>
        </div>
      </div>

      {/* Current Track Player */}
      {currentTrack && (
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{currentTrack.title}</h3>
              <p className="text-gray-600">{currentTrack.artist}</p>
            </div>
            <button
              onClick={skipTrack}
              className="p-2 rounded-full hover:bg-blue-100"
              title="Skip Track"
            >
              <SkipForward size={20} />
            </button>
          </div>
          <AudioPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek} // Updated
            onPlayPause={togglePlay}
          />
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {queue.map((track, index) => (
          <QueueItem
            key={track.id}
            track={track}
            position={index + 1}
            isCurrentTrack={currentTrack?.id === track.id}
          />
        ))}

        {queue.length === 0 && !currentTrack && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Music2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg">The queue is empty</p>
            <p className="text-sm">Add some tracks to get started!</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-100">
          <p className="text-red-600 text-center">{error}</p>
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

export default RadioQueue;
