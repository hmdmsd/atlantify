import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  Music2,
  PlayCircle,
  PauseCircle,
  Heart,
  ListPlus,
} from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/hooks/useAuth";
import { apiClient, apiConfig } from "@/config/api.config";
import { likedSongsService } from "@/services/liked-songs.service";
import { playlistService } from "@/services/playlist.service";
import { Song } from "@/types/song.types";
import { Playlist } from "@/types/playlist.types";
import { AnimatePresence, motion } from "framer-motion";

export const GlobalSongSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredResults, setFilteredResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchResultsVisible, setIsSearchResultsVisible] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { currentTrack, isPlaying, play, pause } = usePlayer();
  const { isAuthenticated } = useAuth();

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
      setFilteredResults(response.songs);
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load initial songs
  useEffect(() => {
    loadInitialSongs();
  }, [loadInitialSongs]);

  // Effect to filter songs in real-time
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults(allSongs);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase().trim();
    const filtered = allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowercasedSearch) ||
        song.artist.toLowerCase().includes(lowercasedSearch)
    );

    setFilteredResults(filtered);
    setIsSearchResultsVisible(filtered.length > 0);
  }, [searchTerm, allSongs]);

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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchResultsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchContainerRef} className="relative w-full">
      {error && <p className="text-red-500">{error}</p>}
      <div className="relative w-full">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsSearchResultsVisible(true);
          }}
          onFocus={() => {
            if (allSongs.length > 0) {
              setIsSearchResultsVisible(true);
            }
          }}
          placeholder="Search songs, artists..."
          className="w-full px-14 py-3 bg-neutral-800/60 backdrop-blur-md text-white text-xl rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/50 placeholder-neutral-400 border border-neutral-700 transition-all duration-300 ease-in-out"
        />
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-400 w-7 h-7" />
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={() => {
              setSearchTerm("");
              setFilteredResults(allSongs);
              setIsSearchResultsVisible(false);
              searchInputRef.current?.focus();
            }}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X className="w-7 h-7" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isSearchResultsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full mt-4 w-full bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl max-h-[600px] overflow-y-auto z-50 p-4"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {filteredResults.length === 0 ? "No results" : "Songs"}
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Music2 className="mx-auto h-16 w-16 mb-4 text-blue-500 opacity-50" />
                <p className="text-xl">No songs found</p>
                <p className="text-neutral-400 mt-2">Try another search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResults.map((song) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center p-3 hover:bg-neutral-800 rounded-xl transition-colors group"
                  >
                    <div className="mr-4">
                      <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-400">
                        <Music2 className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {song.title}
                      </h3>
                      <p className="text-neutral-400 truncate">{song.artist}</p>
                    </div>

                    <div className="text-neutral-400 text-sm mr-4">
                      {formatDuration(song.duration)}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePlay(song)}
                        className="text-neutral-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-500/10"
                      >
                        {isPlaying && currentTrack?.id === song.id ? (
                          <PauseCircle className="w-10 h-10" />
                        ) : (
                          <PlayCircle className="w-10 h-10" />
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
                              className={`w-6 h-6 ${
                                likedSongIds.has(song.id) ? "fill-current" : ""
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => handleAddToPlaylist(song)}
                            className="p-2 rounded-full text-neutral-400 hover:text-blue-500 transition-colors"
                          >
                            <ListPlus className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md"
          >
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GlobalSongSearch;
