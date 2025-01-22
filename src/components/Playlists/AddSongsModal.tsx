import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Song } from "@/types/song.types";
import { apiClient, apiConfig } from "@/config/api.config";

interface AddSongsModalProps {
  isOpen: boolean;
  playlistId: string;
  availableSongs?: Song[];
  onClose: () => void;
  onAddSongs: (songIds: string[]) => void;
  formatDuration: (seconds: number) => string;
}

export const AddSongsModal: React.FC<AddSongsModalProps> = ({
  isOpen,
  availableSongs: initialAvailableSongs = [],
  onClose,
  onAddSongs,
  formatDuration,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableSongs, setAvailableSongs] = useState<Song[]>(
    initialAvailableSongs
  );
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialAvailableSongs.length === 0) {
      fetchAvailableSongs();
    } else {
      setAvailableSongs(initialAvailableSongs);
    }
  }, [isOpen, initialAvailableSongs]);

  const fetchAvailableSongs = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; songs: Song[] }>(
        apiConfig.endpoints.songs.list
      );

      if (response.success) {
        setAvailableSongs(response.songs);
      } else {
        setError("Failed to fetch available songs");
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      setError("An error occurred while fetching songs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSongs = () => {
    onAddSongs(Array.from(selectedSongs));
    setSelectedSongs(new Set());
  };

  const handleClose = () => {
    onClose();
    setSelectedSongs(new Set());
    setSearchTerm("");
  };

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Add Songs to Playlist
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs..."
            className="w-full px-4 py-2 pl-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
        </div>

        {/* Songs List */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="text-center text-neutral-400 py-4">
              Loading songs...
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center text-neutral-400 py-4">
              No songs available
            </div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center p-2 hover:bg-neutral-800/50 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedSongs.has(song.id)}
                  onChange={() => toggleSongSelection(song.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="text-white">{song.title}</p>
                  <p className="text-sm text-neutral-400">{song.artist}</p>
                </div>
                <div className="text-sm text-neutral-500">
                  {formatDuration(song.duration)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSongs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50"
            disabled={selectedSongs.size === 0}
          >
            Add Selected Songs
          </button>
        </div>
      </div>
    </div>
  );
};
