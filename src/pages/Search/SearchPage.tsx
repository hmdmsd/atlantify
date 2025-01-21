import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  X,
  Music2,
  PlayCircle,
  PauseCircle,
  Plus,
} from "lucide-react";
import { useSongs } from "@/contexts/SongsContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth hook
import { apiClient, apiConfig } from "@/config/api.config";
import { SongUploadModal } from "@/components/Modals/SongUploadModal";

// Updated Song interface to match backend response
interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  size: number;
  duration: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  publicUrl: string;
}

// Track interface for player context
interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { currentTrack, isPlaying, play, pause } = usePlayer();
  const { fetchSongs } = useSongs();

  // Get isAdmin and isAuthenticated from useAuth
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true);
      try {
        const songs = await fetchSongs();
        setResults(songs);
      } catch (error) {
        console.error("Error loading songs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSongs();
  }, [fetchSongs]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      const songs = await fetchSongs();
      setResults(songs);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; songs: Song[] }>(
        `${apiConfig.endpoints.songs.list}?search=${encodeURIComponent(
          searchTerm
        )}`
      );
      setResults(response.songs);
    } catch (error) {
      console.error("Error searching songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrack = useCallback(
    async (songId: string) => {
      try {
        // Refresh the song list after upload
        const songs = await fetchSongs();
        setResults(songs);
        setShowUploadModal(false);
      } catch (err) {
        console.error("Failed to add track", err);
      }
    },
    [fetchSongs]
  );

  const handleTogglePlay = (song: Song) => {
    // Ensure we always have a valid URL
    const trackUrl = song.publicUrl || song.path;

    const trackData: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      url: trackUrl,
      duration: song.duration,
    };

    if (currentTrack?.id === song.id) {
      if (isPlaying) {
        pause();
      } else {
        play(trackData);
      }
    } else {
      play(trackData);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Search className="h-8 w-8 text-blue-500" />
            Search
          </h1>
          <p className="mt-2 text-neutral-400">Find your favorite songs</p>
        </div>
        {/* Only show Add Track button to authenticated admins */}
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Track
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs..."
            className="w-full px-4 py-3 pl-10 pr-20 bg-neutral-900 border border-neutral-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 bg-neutral-800 border-y border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            {showFilters ? (
              <X className="w-5 h-5" />
            ) : (
              <Filter className="w-5 h-5" />
            )}
          </button>
          <button
            type="submit"
            className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-r-lg transition-colors"
          >
            Search
          </button>
        </div>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
      </form>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Music2 className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
            <p>No songs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {results.map((song) => (
              <div
                key={song.id}
                className="flex items-center p-4 hover:bg-neutral-800/50 transition-colors group"
              >
                <div className="mr-4">
                  <div className="w-12 h-12 bg-neutral-700 rounded flex items-center justify-center text-neutral-400">
                    <Music2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-neutral-400 truncate">
                    {song.artist}
                  </p>
                </div>

                <div className="text-neutral-400 text-sm mr-4">
                  {formatDuration(song.duration)}
                </div>

                <button
                  onClick={() => handleTogglePlay(song)}
                  className="text-neutral-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-500/10"
                >
                  {isPlaying && currentTrack?.id === song.id ? (
                    <PauseCircle className="w-8 h-8" />
                  ) : (
                    <PlayCircle className="w-8 h-8" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal - Only show for admin users */}
      {isAdmin && showUploadModal && (
        <SongUploadModal
          onClose={() => setShowUploadModal(false)}
          onAddTrack={handleAddTrack}
        />
      )}
    </div>
  );
};

export default SearchPage;
