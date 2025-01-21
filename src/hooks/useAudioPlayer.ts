import { useState, useRef, useEffect, useCallback } from "react";
import { useRadioQueue } from "./useRadioQueue";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

export const useAudioPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Import radio-specific functionality
  const {
    currentTrack: radioTrack,
    isRadioActive,
    skipTrack,
  } = useRadioQueue();

  const audioRef = useRef(new Audio());
  const trackEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);

      // If playing, start playback
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);

      // In radio mode, let the backend handle track progression
      if (isRadioActive) {
        skipTrack().catch(console.error);
      }
    };

    const handleError = (e: Event) => {
      console.error("Audio playback error", e);
      setError("Failed to play audio");
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isRadioActive, skipTrack]);

  // Handle track changes
  useEffect(() => {
    // Prioritize radio track when radio is active
    const trackToPlay = isRadioActive ? radioTrack : currentTrack;

    if (trackToPlay) {
      // Update current track
      setCurrentTrack(trackToPlay);

      // Set audio source
      if (audioRef.current) {
        audioRef.current.src = trackToPlay.url;
        audioRef.current.load();

        // Auto-play if radio is active or currently playing
        if (isRadioActive || isPlaying) {
          audioRef.current.play().catch((err) => {
            console.error("Playback error:", err);
            setError("Failed to play track");
          });
        }
      }
    }
  }, [radioTrack, isRadioActive, currentTrack]);

  // Play method
  const play = useCallback(
    async (track?: Track) => {
      try {
        // If a specific track is provided, set it as current
        if (track) {
          setCurrentTrack(track);
          audioRef.current.src = track.url;
          await audioRef.current.load();
        }

        // Ensure we have a track to play
        if (!currentTrack && !track) {
          throw new Error("No track to play");
        }

        // Start playback
        await audioRef.current.play();
        setIsPlaying(true);
        setError(null);
      } catch (err) {
        console.error("Playback error:", err);
        setIsPlaying(false);
        setError("Failed to play audio");
      } finally {
        setIsLoading(false);
      }
    },
    [currentTrack]
  );

  // Pause method
  const pause = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback(
    (time: number) => {
      // Prevent seeking in radio mode
      if (!isRadioActive) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    [isRadioActive]
  );

  // Volume control
  const setAudioVolume = useCallback((value: number) => {
    const safeValue = Math.max(0, Math.min(1, value));
    audioRef.current.volume = safeValue;
    setVolume(safeValue);
    setIsMuted(safeValue === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      setAudioVolume(volume || 1);
    } else {
      setAudioVolume(0);
    }
  }, [isMuted, volume]);

  return {
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    volume,
    isMuted,
    error,
    play,
    pause,
    togglePlay,
    seek,
    setVolume: setAudioVolume,
    toggleMute,
  };
};
