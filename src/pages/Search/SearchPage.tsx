import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  Music2,
  PlayCircle,
  PauseCircle,
  Plus,
  Heart,
  ListPlus,
} from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/hooks/useAuth";
import { apiClient, apiConfig } from "@/config/api.config";
import { likedSongsService } from "@/services/liked-songs.service";
import { playlistService } from "@/services/playlist.service";
import { SongUploadModal } from "@/components/Modals/SongUploadModal";
import { Playlist } from "@/types/playlist.types";
import { Song } from "@/types/song.types";

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [durationFilter, setDurationFilter] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 600 }); // 0-10 minutes default

  const { currentTrack, isPlaying, play, pause } = usePlayer();
  const { isAuthenticated, isAdmin } = useAuth();

  // Load user's liked songs and playlists
  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedSongIds();
      fetchUserPlaylists();
    }
  }, [isAuthenticated]);

  const fetchLikedSongIds = async () => {
    try {
      const response = await likedSongsService.getLikedSongIds();
      if (response.success) {
        setLikedSongIds(new Set(response.songIds));
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const response = await playlistService.getUserPlaylists();
      if (response.success) {
        setUserPlaylists(response.playlists);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const loadInitialSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; songs: Song[] }>(
        apiConfig.endpoints.songs.list
      );
      setAllSongs(response.songs);
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialSongs();
  }, [loadInitialSongs]);

  // Advanced filtering logic
  const filteredSongs = useMemo(() => {
    return allSongs.filter((song) => {
      // Search term filter (case-insensitive, matches title or artist)
      const matchesSearch =
        !searchTerm.trim() ||
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase());

      // Duration filter
      const matchesDuration =
        song.duration >= durationFilter.min &&
        song.duration <= durationFilter.max;

      return matchesSearch && matchesDuration;
    });
  }, [allSongs, searchTerm, durationFilter]);

  const handleToggleLike = async (song: Song) => {
    if (!isAuthenticated) {
      setError("Please log in to like songs");
      return;
    }

    try {
      const response = await likedSongsService.toggleLikeSong(song.id);
      if (response.success) {
        setLikedSongIds((prev) => {
          const newSet = new Set(prev);
          if (response.liked) {
            newSet.add(song.id);
          } else {
            newSet.delete(song.id);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("Failed to update like status");
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    if (!isAuthenticated) {
      setError("Please log in to add songs to playlists");
      return;
    }
    setSelectedSong(song);
    setShowPlaylistModal(true);
  };

  const handlePlaylistSelect = async (playlistId: string) => {
    if (!selectedSong) return;

    try {
      const response = await playlistService.addSongToPlaylist(
        playlistId,
        selectedSong.id
      );
      if (response.success) {
        setShowPlaylistModal(false);
        setSelectedSong(null);
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      setError("Failed to add song to playlist");
    }
  };

  const handleTogglePlay = (song: Song) => {
    const trackUrl = song.publicUrl || song.path;

    const trackData = {
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs, artists..."
              className="w-full px-4 py-3 pl-10 pr-20 bg-neutral-900 border border-neutral-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 bg-neutral-800 border-y border-neutral-800 text-neutral-400 hover:text-white transition-colors ${
              showFilters ? "bg-blue-600 text-white" : ""
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Song Duration
              </label>
              <div className="flex items-center space-x-4">
                <select
                  value={durationFilter.min}
                  onChange={(e) =>
                    setDurationFilter((prev) => ({
                      ...prev,
                      min: Number(e.target.value),
                    }))
                  }
                  className="bg-neutral-800 text-white rounded px-2 py-1"
                >
                  <option value={0}>0 min</option>
                  <option value={60}>1 min</option>
                  <option value={120}>2 min</option>
                  <option value={180}>3 min</option>
                </select>
                <span className="text-neutral-400">to</span>
                <select
                  value={durationFilter.max}
                  onChange={(e) =>
                    setDurationFilter((prev) => ({
                      ...prev,
                      max: Number(e.target.value),
                    }))
                  }
                  className="bg-neutral-800 text-white rounded px-2 py-1"
                >
                  <option value={180}>3 min</option>
                  <option value={300}>5 min</option>
                  <option value={420}>7 min</option>
                  <option value={600}>10 min</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Music2 className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
            <p>No songs found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredSongs.map((song) => (
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

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
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

                  {isAuthenticated && (
                    <>
                      <button
                        onClick={() => handleToggleLike(song)}
                        className={`p-2 rounded-full transition-colors ${
                          likedSongIds.has(song.id)
                            ? "text-red-500 hover:text-red-400"
                            : "text-neutral-400 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            likedSongIds.has(song.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => handleAddToPlaylist(song)}
                        className="p-2 rounded-full text-neutral-400 hover:text-blue-500 transition-colors"
                      >
                        <ListPlus className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              Add to Playlist
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                  className="w-full p-3 text-left rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-between"
                >
                  <span className="text-white">{playlist.name}</span>
                  <Plus className="w-5 h-5 text-neutral-400" />
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  setSelectedSong(null);
                }}
                className="px-4 py-2 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isAdmin && showUploadModal && (
        <SongUploadModal
          onClose={() => setShowUploadModal(false)}
          onAddTrack={loadInitialSongs}
        />
      )}
    </div>
  );
};

export default SearchPage;
