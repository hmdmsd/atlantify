import React, { createContext, useContext, useState } from "react";
import { audioService } from "../services/audio.service";
import { apiClient, apiConfig } from "../config/api.config";

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  headers?: {
    Authorization: string;
  };
}

interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  duration: number;
  publicUrl?: string;
}

interface SongsContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playingSongId: string | null;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  togglePlay: (song: Song) => void;
  fetchSongs: () => Promise<Song[]>;
}

const SongsContext = createContext<SongsContextType | undefined>(undefined);

export const SongsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const fetchSongs = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; songs: Song[] }>(
        apiConfig.endpoints.songs.list
      );
      return response.songs;
    } catch (error) {
      console.error("Error fetching songs:", error);
      throw error;
    }
  };

  const playSong = async (song: Song) => {
    try {
      // First get the song details to get the latest publicUrl
      const response = await apiClient.get<{ success: boolean; song: Song }>(
        apiConfig.endpoints.songs.details(song.id)
      );

      const songDetails = response.song;

      // Get the auth token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Use the public URL from the song details
      const audioUrl = songDetails.publicUrl;
      if (!audioUrl) {
        throw new Error("No audio URL available");
      }

      await audioService.loadTrack({
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: audioUrl,
        duration: song.duration,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } as AudioTrack);

      await audioService.play();
      setCurrentSong(song);
      setIsPlaying(true);
      setPlayingSongId(song.id);
    } catch (error) {
      console.error("Error playing song:", error);
      setIsPlaying(false);
      setPlayingSongId(null);
    }
  };

  const pauseSong = () => {
    audioService.pause();
    setIsPlaying(false);
  };

  const togglePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(song);
      }
    } else {
      playSong(song);
    }
  };

  return (
    <SongsContext.Provider
      value={{
        currentSong,
        isPlaying,
        playingSongId,
        playSong,
        pauseSong,
        togglePlay,
        fetchSongs,
      }}
    >
      {children}
    </SongsContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error("useSongs must be used within a SongsProvider");
  }
  return context;
};
