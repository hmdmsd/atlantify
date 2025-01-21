import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Music2,
  Plus,
  SkipForward,
  Power,
  VolumeX,
  Volume2,
} from "lucide-react";
import { useRadioQueue } from "@/hooks/useRadioQueue";
import { usePlayer } from "@/contexts/PlayerContext";
import { SongSearchModal } from "@/components/Modals/SongSearchModal";
import { QueueItem } from "@/components/RadioQueue/QueueItem";

export const RadioPage: React.FC = () => {
  const {
    queue,
    currentTrack: radioTrack,
    listeners,
    isConnected,
    isAdmin,
    isRadioActive,
    addToQueue,
    removeFromQueue,
    skipTrack,
    toggleRadioStatus,
  } = useRadioQueue();

  const {
    play,
    pause,
    currentTrack: playerTrack,
    isPlaying,
    requiresInteraction,
    error,
    handleUserInteraction,
    setRadioMode,
  } = usePlayer();

  const [showSongSearchModal, setShowSongSearchModal] = useState(false);

  // Effect to handle radio activation and track changes
  useEffect(() => {
    if (isRadioActive && radioTrack) {
      // Set radio mode first
      setRadioMode(true);

      // Log track data for debugging
      console.log("Radio Track Data:", radioTrack);

      // Construct the full audio URL
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const audioUrl = (() => {
        // If it's already a full URL, use it
        if (
          radioTrack.url?.startsWith("http") ||
          radioTrack.path?.startsWith("http")
        ) {
          return radioTrack.url || radioTrack.path;
        }

        // If it starts with slash, append to base URL
        if (
          radioTrack.url?.startsWith("/") ||
          radioTrack.path?.startsWith("/")
        ) {
          return `${baseUrl}${radioTrack.url || radioTrack.path}`;
        }

        // Otherwise, assume it's relative to base URL
        return `${baseUrl}/${radioTrack.url || radioTrack.path}`;
      })();

      console.log("Constructed Audio URL:", audioUrl);

      // Format track data with complete URL
      const trackData = {
        id: radioTrack.id,
        title: radioTrack.title,
        artist: radioTrack.artist,
        url: audioUrl,
        duration: radioTrack.duration || 0,
      };

      // Only attempt to play if we have a valid URL
      if (trackData.url && trackData.url !== "undefined") {
        // Play the track immediately
        play(trackData, true).catch((error) => {
          console.error("Failed to play track:", error);
        });
      } else {
        console.error("No valid audio URL found for track:", radioTrack);
      }
    } else if (!isRadioActive) {
      setRadioMode(false);
      pause();
    }
  }, [isRadioActive, radioTrack?.id]); // Only depend on track ID and radio state

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

  const handleContainerClick = () => {
    if (requiresInteraction) {
      handleUserInteraction();
    }
  };

  return (
    <div
      className="p-6 space-y-8 max-w-7xl mx-auto"
      onClick={handleContainerClick}
    >
      {/* Autoplay Message */}
      {requiresInteraction && isRadioActive && radioTrack && (
        <div className="bg-blue-500/20 text-blue-400 p-4 rounded-lg mb-4 flex items-center justify-center space-x-2">
          <Music2 className="w-5 h-5" />
          <span>Click anywhere to start playback</span>
        </div>
      )}

      {/* Error Message */}
      {error && !requiresInteraction && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-4 flex items-center justify-center space-x-2">
          <VolumeX className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

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
      {radioTrack && isRadioActive && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-neutral-800 rounded-lg flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {radioTrack.title}
                </h3>
                <p className="text-neutral-400">{radioTrack.artist}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Live Radio
                </span>
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
            isCurrentTrack={radioTrack?.id === track.id}
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
