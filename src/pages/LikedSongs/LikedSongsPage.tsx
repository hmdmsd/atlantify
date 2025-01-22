import React, { useState, useEffect } from "react";
import { Heart, Play, Pause, Music2, Loader } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { likedSongsService } from "@/services/liked-songs.service";
import { songStatsService } from "@/services/song-stats.service";
import { useAuth } from "@/hooks/useAuth";

// Adjusted type to match the nested structure
interface LikedSong {
  id: string;
  likedId: string;
  title: string;
  artist: string;
  duration: number;
  path: string;
  publicUrl: string | null;
  createdAt: string;
}

export const LikedSongsPage: React.FC = () => {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, isPlaying, play, pause, playMultiple } = usePlayer();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedSongs();
    }
  }, [isAuthenticated]);

  const fetchLikedSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await likedSongsService.getLikedSongs();
      if (response.success) {
        // Extract actual song data from nested structure
        const extractedSongs = response.songs.map((likedSong: any) => ({
          ...likedSong.song,
          likedId: likedSong.id,
          createdAt: likedSong.createdAt,
        }));
        setLikedSongs(extractedSongs);
      }
    } catch (err) {
      setError("Failed to fetch liked songs");
      console.error("Error fetching liked songs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      const tracks = likedSongs.map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        url: song.publicUrl || song.path,
      }));
      playMultiple(tracks);
    }
  };

  const handleTogglePlay = async (song: LikedSong) => {
    const trackData = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      url: song.publicUrl || song.path,
    };

    try {
      if (currentTrack?.id === song.id) {
        if (isPlaying) {
          pause();
        } else {
          play(trackData);
        }
      } else {
        play(trackData);
        // Increment play count
        await songStatsService.incrementPlayCount(song.id);
      }
    } catch (err) {
      console.error("Error handling playback:", err);
    }
  };

  const handleUnlike = async (songId: string) => {
    try {
      const response = await likedSongsService.toggleLikeSong(songId);
      if (response.success) {
        // Remove song from the list
        setLikedSongs((prev) => prev.filter((song) => song.id !== songId));
      }
    } catch (err) {
      console.error("Error unliking song:", err);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center text-neutral-400">
          <Heart className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
          <p>Please log in to see your liked songs</p>
        </div>
      </div>
    );
  }

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
              onClick={handlePlayAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
              title="Play All Liked Songs"
            >
              Play All
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Liked Songs List */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
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
                  <div className="w-12 h-12 bg-neutral-700 rounded flex items-center justify-center text-neutral-400">
                    <Music2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-neutral-400 truncate">
                    {song.artist}
                  </p>
                </div>

                {/* Added Date */}
                <div className="text-neutral-400 text-sm mr-4 hidden md:block">
                  {formatDate(song.createdAt)}
                </div>

                {/* Duration */}
                <div className="text-neutral-400 text-sm mr-4">
                  {formatDuration(song.duration)}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePlay(song)}
                    className="text-neutral-400 hover:text-blue-500 transition-colors"
                    title={
                      currentTrack?.id === song.id && isPlaying
                        ? "Pause"
                        : "Play"
                    }
                  >
                    {currentTrack?.id === song.id && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleUnlike(song.id)}
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
