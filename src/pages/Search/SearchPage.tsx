import React, { useState } from "react";
import { Search, Filter, X, Music2, PlayCircle, Heart } from "lucide-react";

// Mock interfaces (replace with actual types from your API)
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumArtUrl?: string;
}

interface FilterOptions {
  genre?: string;
  year?: number;
  popularity?: "low" | "medium" | "high";
}

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Simulated search function (replace with actual API call)
  const performSearch = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      const mockResults: Song[] = [
        {
          id: "1",
          title: "Bohemian Rhapsody",
          artist: "Queen",
          album: "A Night at the Opera",
          duration: 354,
          albumArtUrl: "/api/album-art/queen-night-at-the-opera.jpg",
        },
        {
          id: "2",
          title: "Stairway to Heaven",
          artist: "Led Zeppelin",
          album: "Led Zeppelin IV",
          duration: 482,
          albumArtUrl: "/api/album-art/led-zeppelin-iv.jpg",
        },
        // Add more mock results
      ];

      setResults(mockResults);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Render filter options
  const renderFilterOptions = () => {
    const genres = ["Rock", "Pop", "Hip Hop", "Electronic", "Classical"];
    const years = [2020, 2021, 2022, 2023, 2024];

    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Genre
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setFilters((prev) => ({ ...prev, genre }))}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.genre === genre
                    ? "bg-blue-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Year
          </label>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setFilters((prev) => ({ ...prev, year }))}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.year === year
                    ? "bg-blue-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Search className="h-8 w-8 text-blue-500" />
            Search
          </h1>
          <p className="mt-2 text-neutral-400">
            Find your favorite songs, artists, and albums
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs, artists, albums..."
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

      {/* Filter Options */}
      {showFilters && renderFilterOptions()}

      {/* Search Results */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Music2 className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
            <p>No results found. Try a different search term.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {results.map((song) => (
              <div
                key={song.id}
                className="flex items-center p-4 hover:bg-neutral-800/50 transition-colors group"
              >
                {/* Album Art */}
                <div className="mr-4">
                  {song.albumArtUrl ? (
                    <img
                      src={song.albumArtUrl}
                      alt={song.album}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-neutral-700 rounded flex items-center justify-center text-neutral-400">
                      <Music2 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-neutral-400 truncate">
                    {song.artist} • {song.album}
                  </p>
                </div>

                {/* Song Duration */}
                <div className="text-neutral-400 text-sm mr-4">
                  {formatDuration(song.duration)}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    className="text-neutral-400 hover:text-blue-500 transition-colors"
                    title="Play"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </button>
                  <button
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                    title="Like"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
