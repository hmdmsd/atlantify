import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface AudioPlayerProps {
  currentTrack: Track | null; // Allow null
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onMetadataLoaded?: (audio: any) => void;
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

  const audioRef = useRef<HTMLAudioElement>(new Audio());

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
        onMetadataLoaded(audio.duration); // Pass the duration
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold truncate">
              {currentTrack?.title || "No track selected"}
            </h3>
            <p className="text-gray-600 truncate">
              {currentTrack?.artist || "Unknown artist"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={!onPrevious}
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
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
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={!onNext}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
