// pages/Home/HomePage.tsx
import React, { useState, useEffect } from "react";
import { Music2, Radio, Plus, Play, Clock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useRadioQueue } from "../../hooks/useRadioQueue";

interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  addedBy: string;
  addedAt: string;
}

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { currentTrack, play, isPlaying } = useAudioPlayer();
  const { queue } = useRadioQueue();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyPlayed();
  }, []);

  const fetchRecentlyPlayed = async () => {
    try {
      const response = await fetch("/api/songs/recently-played");
      if (!response.ok)
        throw new Error("Failed to fetch recently played songs");
      const data = await response.json();
      setRecentlyPlayed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Continue listening to your favorite music or discover new tracks.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Radio Station</h3>
            <p className="text-sm opacity-90">{queue.length} tracks in queue</p>
          </div>
          <Radio className="h-8 w-8" />
        </div>

        <div className="bg-purple-500 text-white rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Music Box</h3>
            <p className="text-sm opacity-90">Share your music suggestions</p>
          </div>
          <Music2 className="h-8 w-8" />
        </div>

        <div className="bg-green-500 text-white rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Upload Music</h3>
            <p className="text-sm opacity-90">Add tracks to the library</p>
          </div>
          <Plus className="h-8 w-8" />
        </div>
      </div>

      {/* Recent Plays Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Recently Played
          </h2>
        </div>

        {error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : (
          <div className="divide-y">
            {recentlyPlayed.map((song) => (
              <div
                key={song.id}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() =>
                    play({
                      id: song.id,
                      title: song.title,
                      artist: song.artist,
                      url: song.url,
                    })
                  }
                  className="p-2 rounded-full hover:bg-blue-100 mr-4"
                >
                  <Play className="h-5 w-5 text-blue-500" />
                </button>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{song.title}</h3>
                  <p className="text-sm text-gray-600">{song.artist}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(song.duration)}
                  </div>
                  <div>Added {formatDate(song.addedAt)}</div>
                </div>
              </div>
            ))}

            {recentlyPlayed.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No recently played tracks. Start listening to see your history!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Now Playing Section */}
      {currentTrack && (
        <div className="fixed bottom-20 right-4 max-w-sm bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {currentTrack.title}
              </h4>
              <p className="text-sm text-gray-600">{currentTrack.artist}</p>
            </div>
            <div className="ml-4">
              {isPlaying ? (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
