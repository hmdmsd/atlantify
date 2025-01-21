import React from "react";
import {
  Pause,
  SkipForward,
  SkipBack,
  AlertCircle,
  Music2,
  Play,
} from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useRadioQueue } from "@/hooks/useRadioQueue";
import { VolumeControl } from "./VolumeControl";
import { ProgressBar } from "./ProgressBar";

interface AudioPlayerProps {
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = () => {
  const {
    currentTrack: playerTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    requiresInteraction,
    isRadioMode,
    togglePlay: togglePlayerPlay,
    seek,
    next: playerNext,
    previous,
    setVolume,
    toggleMute,
    handleUserInteraction,
  } = usePlayer();

  const {
    currentTrack: radioTrack,
    isRadioActive,
    skipTrack: radioSkipTrack,
    isAdmin, // Add isAdmin from useRadioQueue
  } = useRadioQueue();

  // Determine the current track (prioritize radio track if radio is active)
  const currentTrack = isRadioActive ? radioTrack : playerTrack;

  // Determine skip action based on mode
  const handleSkip = isRadioActive ? radioSkipTrack : playerNext;

  const handlePlayClick = () => {
    if (requiresInteraction) {
      handleUserInteraction();
    } else if (!isRadioActive) {
      togglePlayerPlay();
    }
  };

  // If no track is playing, don't render the player
  if (!currentTrack) {
    return null;
  }

  return (
    <div className="bg-neutral-900 border-t border-neutral-800">
      {requiresInteraction && currentTrack && (
        <div className="bg-blue-500/20 text-blue-400 p-2 text-center text-sm flex items-center justify-center gap-2">
          <Music2 className="w-4 h-4" />
          <span>Click the play button to start playback</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="h-24 px-4 flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-14 h-14 bg-neutral-800 rounded-lg flex items-center justify-center">
              <Music2 className="w-6 h-6 text-neutral-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-medium truncate">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-neutral-400 truncate">
                {currentTrack.artist}
              </p>
              {/* Radio Mode Indicator */}
              {isRadioActive && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Live Radio
                </span>
              )}
              {error && !requiresInteraction && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={previous}
                disabled={isRadioMode}
                className={`
                  text-neutral-400 transition-colors p-2 rounded-full
                  ${
                    isRadioMode
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-white hover:bg-neutral-800"
                  }
                `}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handlePlayClick}
                disabled={isLoading || (isRadioActive && !requiresInteraction)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full 
                  ${
                    isRadioActive && !requiresInteraction
                      ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                      : "bg-white text-black hover:bg-neutral-200"
                  }
                  transition-colors disabled:opacity-50
                `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-600 border-t-neutral-200 rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={!isAdmin && isRadioMode}
                className={`
                  text-neutral-400 transition-colors p-2 rounded-full
                  ${
                    !isAdmin && isRadioMode
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-white hover:bg-neutral-800"
                  }
                `}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              disabled={isRadioMode}
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onMuteToggle={toggleMute}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
