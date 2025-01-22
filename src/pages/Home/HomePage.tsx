import React, { useState, useEffect } from "react";
import {
  Music2,
  Radio,
  Plus,
  Play,
  Pause,
  Clock,
  Headphones,
  TrendingUp,
  Disc3,
} from "lucide-react";

// Import services
import { songStatsService } from "@/services/song-stats.service";
import { useAuth } from "@/hooks/useAuth";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Song } from "@/types/song.types";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { currentTrack, play, isPlaying, togglePlay } = useAudioPlayer();

  // State for various data
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<Song[]>([]);
  const [globalStats, setGlobalStats] = useState<{
    totalPlays: number;
    uniqueListeners: number;
    topGenres: { name: string; count: number }[];
  }>({
    totalPlays: 0,
    uniqueListeners: 0,
    topGenres: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        // Fetch recently played tracks
        const recentResponse = await songStatsService.getRecentlyPlayed(5);
        if (recentResponse.success) {
          setRecentlyPlayed(recentResponse.songs);
        }

        // Fetch recommended/trending tracks
        const trendingResponse = await songStatsService.getTrendingSongs();
        if (trendingResponse.success) {
          setRecommendedTracks(trendingResponse.songs);
        }

        // Fetch global stats
        const globalStatsResponse = await songStatsService.getGlobalStats();
        if (globalStatsResponse.success) {
          setGlobalStats(globalStatsResponse.stats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Radio Station",
      description: "Discover new music",
      icon: <Radio className="h-8 w-8" />,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Music Box",
      description: "Collaborative Playlist",
      icon: <Music2 className="h-8 w-8" />,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-500",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Upload Music",
      description: "Add new tracks",
      icon: <Plus className="h-8 w-8" />,
      bgColor: "bg-green-500/10",
      textColor: "text-green-500",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Good evening, {user?.username || "Music Lover"}
        </h1>
        <p className="text-neutral-400 text-lg">
          Discover new music, explore your favorites, and keep the rhythm going.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className={`${action.bgColor} ${action.textColor} rounded-xl p-6 border ${action.borderColor} hover:bg-opacity-20 transition-colors cursor-pointer group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-white transition-colors">
                  {action.title}
                </h3>
                <p className="opacity-80 group-hover:opacity-100 transition-opacity">
                  {action.description}
                </p>
              </div>
              {React.cloneElement(action.icon, {
                className: `${action.icon.props.className} group-hover:scale-110 transition-transform`,
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recommended & Recently Played Sections */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recently Played Section */}
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800">
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              Recently Played
            </h2>
            <button className="text-neutral-400 hover:text-blue-500 transition-colors text-sm">
              See All
            </button>
          </div>

          {error ? (
            <div className="p-6 text-red-400">{error}</div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {recentlyPlayed.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No recently played tracks. Start listening!
                </div>
              ) : (
                recentlyPlayed.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center p-4 hover:bg-neutral-800/50 transition-colors group"
                  >
                    <button
                      onClick={() =>
                        currentTrack?.id === song.id
                          ? togglePlay()
                          : play({
                              id: song.id,
                              title: song.title,
                              artist: song.artist,
                              url: song.path,
                              duration: song.duration,
                            })
                      }
                      className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-blue-500 hover:bg-neutral-700 mr-4 transition-colors"
                    >
                      {currentTrack?.id === song.id && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {song.title}
                      </h3>
                      <p className="text-sm text-neutral-400 truncate">
                        {song.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Recommended Tracks Section */}
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800">
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Recommended for You
            </h2>
            <button className="text-neutral-400 hover:text-blue-500 transition-colors text-sm">
              See All
            </button>
          </div>

          <div className="divide-y divide-neutral-800">
            {recommendedTracks.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                No recommendations available.
              </div>
            ) : (
              recommendedTracks.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center p-4 hover:bg-neutral-800/50 transition-colors group"
                >
                  <button
                    onClick={() =>
                      currentTrack?.id === song.id
                        ? togglePlay()
                        : play({
                            id: song.id,
                            title: song.title,
                            artist: song.artist,
                            url: song.path,
                            duration: song.duration,
                          })
                    }
                    className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-blue-500 hover:bg-neutral-700 mr-4 transition-colors"
                  >
                    <Play className="h-5 w-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {song.title}
                    </h3>
                    <p className="text-sm text-neutral-400 truncate">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center">
                      <Disc3 className="h-4 w-4 mr-1" />
                      {formatDuration(song.duration)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Listening Stats */}
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Headphones className="w-6 h-6 text-blue-500" />
              Listening Stats
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-neutral-400 text-sm">Total Plays</p>
              <p className="text-2xl font-bold text-white">
                {globalStats.totalPlays.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Unique Listeners</p>
              <p className="text-2xl font-bold text-white">
                {globalStats.uniqueListeners.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Top Genres
            </h2>
          </div>
          <div className="space-y-2">
            {globalStats.topGenres.slice(0, 3).map((genre) => (
              <div key={genre.name} className="flex justify-between">
                <span className="text-neutral-400">{genre.name}</span>
                <span className="text-white font-semibold">
                  {genre.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-500" />
              Quick Links
            </h2>
          </div>
          <div className="space-y-2">
            <a
              href="/upload"
              className="block text-neutral-400 hover:text-blue-500 transition-colors"
            >
              Upload Music
            </a>
            <a
              href="/create-playlist"
              className="block text-neutral-400 hover:text-blue-500 transition-colors"
            >
              Create Playlist
            </a>
            <a
              href="/explore"
              className="block text-neutral-400 hover:text-blue-500 transition-colors"
            >
              Explore New Music
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
