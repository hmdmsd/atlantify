import React, { useState, useEffect } from "react";
import { Search, Music2, Plus, X, Clock, User } from "lucide-react";
import { useRadioQueue } from "@/hooks/useRadioQueue";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  publicUrl?: string;
}

interface SongSearchModalProps {
  onClose: () => void;
  onAddToQueue: (songId: string) => Promise<void>;
}

export const SongSearchModal: React.FC<SongSearchModalProps> = ({
  onClose,
  onAddToQueue,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    availableSongs,
    fetchAvailableSongs,
    error: queueError,
  } = useRadioQueue();

  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch songs on component mount and when search term changes
  useEffect(() => {
    const searchSongs = async () => {
      setIsLoading(true);
      try {
        await fetchAvailableSongs(searchTerm);
      } catch (err) {
        setError("Failed to fetch songs");
      } finally {
        setIsLoading(false);
      }
    };

    searchSongs();
  }, [searchTerm, fetchAvailableSongs]);

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle song selection
  const toggleSongSelection = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // Add selected songs to queue
  const handleAddToQueue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Add songs sequentially
      for (const songId of selectedSongs) {
        await onAddToQueue(songId);
      }

      // Clear selection and close modal
      setSelectedSongs([]);
      onClose();
    } catch (err) {
      setError("Failed to add songs to queue");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Music2 className="w-8 h-8 text-blue-500" />
            Search Songs
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-neutral-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs by title or artist..."
              className="w-full px-4 py-3 pl-10 pr-4 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error || queueError ? (
            <div className="text-center py-12 text-red-500">
              {error || queueError}
            </div>
          ) : availableSongs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Music2 className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
              <p>No songs found.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {availableSongs.map((song) => (
                <div
                  key={song.id}
                  className={`
                    flex items-center p-4 hover:bg-neutral-800/50 transition-colors cursor-pointer
                    ${selectedSongs.includes(song.id) ? "bg-blue-900/30" : ""}
                  `}
                  onClick={() => toggleSongSelection(song.id)}
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

                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(song.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className="ml-4">
                    {selectedSongs.includes(song.id) ? (
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-neutral-600 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add to Queue Button */}
        {selectedSongs.length > 0 && (
          <div className="p-6 border-t border-neutral-800 flex justify-between items-center">
            <p className="text-neutral-400">
              {selectedSongs.length} song{selectedSongs.length > 1 ? "s" : ""}{" "}
              selected
            </p>
            <button
              onClick={handleAddToQueue}
              disabled={isLoading}
              className="
                flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                text-white rounded-full transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Plus className="w-5 h-5" />
              Add to Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default SongSearchModal;
