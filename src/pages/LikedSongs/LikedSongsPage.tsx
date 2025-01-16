import React, { useState, useEffect } from "react";
import { Heart, Play, Pause, Music2 } from "lucide-react";

// Mock interface for a song (replace with actual type from your API)
interface LikedSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  addedAt: string;
  albumArtUrl?: string;
}

export const LikedSongsPage: React.FC = () => {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<string | null>(
    null
  );

  // Simulated fetch of liked songs (replace with actual API call)
  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        // Simulate API delay and data
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockLikedSongs: LikedSong[] = [
          {
            id: "1",
            title: "Blinding Lights",
            artist: "The Weeknd",
            album: "After Hours",
            duration: 200,
            addedAt: "2023-06-15T10:30:00Z",
            albumArtUrl: "/api/album-art/blinding-lights.jpg",
          },
          {
            id: "2",
            title: "Levitating",
            artist: "Dua Lipa",
            album: "Future Nostalgia",
            duration: 203,
            addedAt: "2023-07-20T15:45:00Z",
            albumArtUrl: "/api/album-art/levitating.jpg",
          },
          // Add more mock songs
        ];

        setLikedSongs(mockLikedSongs);
      } catch (error) {
        console.error("Failed to fetch liked songs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Toggle play/pause for a song
  const togglePlaySong = (songId: string) => {
    setCurrentPlayingSong(currentPlayingSong === songId ? null : songId);
  };

  // Unlike a song
  const unlikeSong = (songId: string) => {
    setLikedSongs(likedSongs.filter((song) => song.id !== songId));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Heart className="h-8 w-8 text-blue-500" />
            Liked Songs
          </h1>
          <p className="mt-2 text-neutral-400">
            Your collection of favorite tracks
          </p>
        </div>
        {likedSongs.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-neutral-400">{likedSongs.length} songs</span>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
              title="Play All Liked Songs"
            >
              Play All
            </button>
          </div>
        )}
      </div>

      {/* Liked Songs List */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : likedSongs.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Heart className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
            <p>No liked songs yet. Start liking your favorite tracks!</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {likedSongs.map((song) => (
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

                {/* Added Date */}
                <div className="text-neutral-400 text-sm mr-4 hidden md:block">
                  {formatDate(song.addedAt)}
                </div>

                {/* Duration */}
                <div className="text-neutral-400 text-sm mr-4">
                  {formatDuration(song.duration)}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePlaySong(song.id)}
                    className="text-neutral-400 hover:text-blue-500 transition-colors"
                    title={currentPlayingSong === song.id ? "Pause" : "Play"}
                  >
                    {currentPlayingSong === song.id ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => unlikeSong(song.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    title="Remove from Liked Songs"
                  >
                    <Heart className="w-5 h-5 fill-current" />
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

export default LikedSongsPage;
