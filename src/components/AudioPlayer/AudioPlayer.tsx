import React, { useRef, useState, useEffect } from "react";
import { audioService } from '../../services/audio.service';

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url?: string;
  views?: number;
}

interface AudioPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onMetadataLoaded?: (duration: number) => void;
}


export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  onPlayPause,
  onNext,
  onPrevious,
  onMetadataLoaded,
}) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [viewCount, setViewCount] = useState<number>(0);
  const viewRecorded = useRef(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    // Update view count when track changes
    if (currentTrack) {
      audioService.getTrackViews(currentTrack.id)
        .then(setViewCount)
        .catch(console.error);
    }

    // Listen for new views
    const handleViewRecorded = () => {
      setViewCount(prev => prev + 1);
    };

    audioService.onViewRecorded(handleViewRecorded);

    return () => {
      // Clean up listener
      audioService.removeListener('viewRecorded', handleViewRecorded);
    };
  }, [currentTrack?.id]);



  useEffect(() => {
    if (currentTrack?.url) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (onMetadataLoaded) {
        onMetadataLoaded(audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onMetadataLoaded]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => onSeek(audio.currentTime);
    const handleLoadedMetadata = () => onSeek(audio.duration);
    const handleEnded = () => {
      if (onNext) onNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onNext, onSeek]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    onPlayPause();
  };

  const handleSeek = (value: number) => {
    audioRef.current.currentTime = value;
    onSeek(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    audioRef.current.volume = value;
    setIsMuted(value === 0);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Helper function to format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Render nothing if no track is present
  if (!currentTrack) return null;

  return (
    <div className="border-t border-neutral-800 bg-neutral-900">
      <div className="max-w-7xl mx-auto flex items-center space-x-6 p-4">
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">
            {currentTrack.title}
          </h3>
          <p className="text-neutral-400 text-sm truncate">
            {currentTrack.artist}
          </p>
          <p className="text-neutral-500 text-xs">
            {viewCount.toLocaleString()} views
          </p>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-grow">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrevious}
              className="text-neutral-400 hover:text-white transition-colors"
              disabled={!onPrevious}
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
              disabled={!currentTrack}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={onNext}
              className="text-neutral-400 hover:text-white transition-colors"
              disabled={!onNext}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-3 w-full">
            <span className="text-xs text-neutral-500">
              {formatTime(currentTime)}
            </span>
            <div className="flex-grow">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1 bg-neutral-700 appearance-none cursor-pointer rounded-full
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:bg-blue-500 
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:appearance-none 
                  [&::-moz-range-thumb]:w-4 
                  [&::-moz-range-thumb]:h-4 
                  [&::-moz-range-thumb]:bg-blue-500 
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
            <span className="text-xs text-neutral-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMuteToggle}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-24 h-1 bg-neutral-700 appearance-none cursor-pointer rounded-full
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:bg-blue-500 
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:appearance-none 
              [&::-moz-range-thumb]:w-4 
              [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:bg-blue-500 
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
