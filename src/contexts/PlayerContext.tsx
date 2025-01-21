import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  queue: Track[];
  isRadioMode: boolean;
  requiresInteraction: boolean;
  play: (track: Track, radioMode?: boolean) => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setRadioMode: (active: boolean) => void;
  handleUserInteraction: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isRadioMode, setIsRadioMode] = useState(false);
  const [requiresInteraction, setRequiresInteraction] = useState(true);
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (isPlaying && !requiresInteraction) {
        audio.play().catch((error) => {
          if (error.name === "NotAllowedError") {
            setRequiresInteraction(true);
            setError("Click anywhere to start playback");
          }
        });
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!isRadioMode) {
        next();
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error("Audio playback error:", e);
      setError("Failed to play audio. Please try again.");
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);

    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError as EventListener);
    };
  }, [isPlaying, isRadioMode, volume, requiresInteraction]);

  const handleUserInteraction = useCallback(() => {
    setRequiresInteraction(false);
    if (pendingTrack) {
      const track = pendingTrack;
      setPendingTrack(null);
      play(track, isRadioMode);
    }
  }, [isRadioMode, pendingTrack]);

  useEffect(() => {
    const handleDocumentClick = () => {
      if (requiresInteraction) {
        handleUserInteraction();
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [requiresInteraction, handleUserInteraction]);

  const play = async (track?: Track, radioMode: boolean = false) => {
    try {
      setError(null);
      setIsLoading(true);

      if (track) {
        if (!track.url) {
          throw new Error("No audio URL provided");
        }

        if (requiresInteraction) {
          setPendingTrack(track);
          setError("Click anywhere to start playback");
          return;
        }

        setIsRadioMode(radioMode);

        if (currentTrack?.id !== track.id || isRadioMode !== radioMode) {
          audioRef.current.src = track.url;
          setCurrentTrack(track);
          await audioRef.current.load();
        }
      }

      try {
        if (audioRef.current.src) {
          await audioRef.current.play();
          setIsPlaying(true);
          setError(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "NotAllowedError") {
          setRequiresInteraction(true);
          setPendingTrack(track || currentTrack);
          setError("Click anywhere to start playback");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error playing track:", error);
      setError("Failed to play audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pause = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      play(currentTrack, isRadioMode);
    }
  }, [currentTrack, isPlaying, isRadioMode, pause]);

  const seek = useCallback(
    (time: number) => {
      if (!isRadioMode) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    [isRadioMode]
  );

  const next = useCallback(() => {
    if (!isRadioMode && queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      play(nextTrack, false);
    }
  }, [queue, isRadioMode]);

  const previous = useCallback(() => {
    if (!isRadioMode) {
      // Implement previous track logic if needed
    }
  }, [isRadioMode]);

  const setVolume = useCallback((newVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = safeVolume;
    setVolumeState(safeVolume);
    setIsMuted(safeVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const addToQueue = useCallback(
    (track: Track) => {
      if (!isRadioMode) {
        setQueue((prevQueue) => [...prevQueue, track]);
      }
    },
    [isRadioMode]
  );

  const removeFromQueue = useCallback(
    (trackId: string) => {
      if (!isRadioMode) {
        setQueue((prevQueue) =>
          prevQueue.filter((track) => track.id !== trackId)
        );
      }
    },
    [isRadioMode]
  );

  const clearQueue = useCallback(() => {
    if (!isRadioMode) {
      setQueue([]);
    }
  }, [isRadioMode]);

  const setRadioMode = useCallback(
    (active: boolean) => {
      setIsRadioMode(active);
      if (active) {
        clearQueue();
      }
    },
    [clearQueue]
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isLoading,
        error,
        queue,
        isRadioMode,
        requiresInteraction,
        play,
        pause,
        togglePlay,
        seek,
        next,
        previous,
        setVolume,
        toggleMute,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setRadioMode,
        handleUserInteraction,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export default PlayerProvider;
