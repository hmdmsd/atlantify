import React, { useState, useEffect, useCallback } from "react";
import { ApiClient, apiConfig } from "@/config/api.config";
import { FileAudio, Search, X } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface SongSearchModalProps {
  onClose: () => void;
  onAddToQueue: (songId: string) => void;
}

export const SongSearchModal: React.FC<SongSearchModalProps> = ({
  onClose,
  onAddToQueue,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const apiClient = ApiClient.getInstance();

  const fetchSongs = useCallback(async () => {
    try {
      const response = await apiClient.get<{ songs: Song[] }>(
        apiConfig.endpoints.songs.list
      );
      setSongs(response.songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddToQueue = (songId: string) => {
    onAddToQueue(songId);
    onClose();
  };

  const filteredSongs = songs.filter((song) =>
    `${song.title.toLowerCase()} ${song.artist.toLowerCase()}`.includes(
      searchTerm.toLowerCase()
    )
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Add a Song to the Queue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search for a song
            </label>
            <div className="flex items-center border rounded-lg">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                placeholder="Search by title or artist"
              />
              <div className="pr-3 text-gray-400">
                <Search size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => handleAddToQueue(song.id)}
              >
                <FileAudio className="text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">{song.title}</div>
                  <div className="text-gray-600">{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
