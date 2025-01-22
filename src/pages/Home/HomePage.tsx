import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Music2,
  Radio,
  Heart,
  ListMusic,
  User,
  Clock,
  Upload,
  Play,
  Plus,
} from "lucide-react";

// Import services and hooks
import { playlistService } from "@/services/playlist.service";
import { likedSongsService } from "@/services/liked-songs.service";
import { useAuth } from "@/hooks/useAuth";
import { useRadioQueue } from "@/hooks/useRadioQueue";

// Import types
import type { Song } from "@/types/song.types";
import type { Playlist } from "@/types/playlist.types";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { isRadioActive, listeners } = useRadioQueue();

  // State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!isAuthenticated) return;

      try {
        setError(null);

        // Fetch user's playlists
        try {
          const playlistsResponse = await playlistService.getUserPlaylists();
          if (playlistsResponse.success) {
            setPlaylists(playlistsResponse.playlists);
          }
        } catch (err) {
          console.error("Failed to fetch playlists:", err);
        }

        // Fetch liked songs
        try {
          const likedResponse = await likedSongsService.getLikedSongs();
          if (likedResponse.success) {
            setLikedSongs(likedResponse.songs);
          }
        } catch (err) {
          console.error("Failed to fetch liked songs:", err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchHomeData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <Music2 className="w-16 h-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Atlantify
        </h1>
        <p className="text-neutral-400 mb-8">
          Please log in to access your music library
        </p>
        <Link
          to="/auth/login"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          Welcome back, {user?.username || "Music Lover"}
        </h1>
        <p className="text-neutral-400 text-lg">
          {new Date().getHours() < 12
            ? "Good morning"
            : new Date().getHours() < 18
            ? "Good afternoon"
            : "Good evening"}
          ! Ready to discover some great music?
        </p>
      </motion.div>

      {/* Quick Access Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <Link
          to="/radio"
          className="bg-[#1a1f37] hover:bg-[#1e2442] p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <Radio className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold text-white">Radio Station</h3>
              <p className="text-sm text-neutral-400">
                {isRadioActive ? `${listeners} listening` : "Join live radio"}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/music-box"
          className="bg-[#2a1a37] hover:bg-[#321e42] p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <Music2 className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="font-semibold text-white">Music Box</h3>
              <p className="text-sm text-neutral-400">Suggest songs</p>
            </div>
          </div>
        </Link>

        <Link
          to="/liked"
          className="bg-[#371a1a] hover:bg-[#421e1e] p-6 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-semibold text-white">Liked Songs</h3>
              <p className="text-sm text-neutral-400">
                {likedSongs.length} songs
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/playlists"
          className="bg-[#1a371f] hover:bg-[#1e4223] p-6 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <ListMusic className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="font-semibold text-white">Playlists</h3>
              <p className="text-sm text-neutral-400">
                {playlists.length} playlists
              </p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Playlists Overview */}
        <motion.div variants={itemVariants}>
          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ListMusic className="w-6 h-6 text-green-500" />
                Your Playlists
              </h2>
              <Link
                to="/playlists/create"
                className="text-neutral-400 hover:text-green-500 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Create New
              </Link>
            </div>

            <div className="divide-y divide-neutral-800">
              {playlists.slice(0, 4).map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlists/${playlist.id}`}
                  className="flex items-center p-4 hover:bg-neutral-800/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-neutral-800 rounded flex items-center justify-center mr-4">
                    {playlist.coverImage ? (
                      <img
                        src={playlist.coverImage}
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <ListMusic className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate group-hover:text-green-500 transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-neutral-400 truncate">
                      {playlist.songs?.length || 0} songs
                    </p>
                  </div>

                  <Play className="w-5 h-5 text-neutral-400 group-hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}

              {playlists.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  <ListMusic className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p>No playlists yet</p>
                  <Link
                    to="/playlists/create"
                    className="text-sm mt-2 text-green-500 hover:text-green-400 transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first playlist
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Overview */}
        <motion.div variants={itemVariants}>
          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Quick Actions
              </h2>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <Link
                to="/search"
                className="p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors group"
              >
                <Upload className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-medium text-white">Upload Music</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Share your tracks
                </p>
              </Link>

              <Link
                to="/profile"
                className="p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors group"
              >
                <User className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-medium text-white">Profile</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  View your activity
                </p>
              </Link>

              <Link
                to="/radio"
                className="p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors group"
              >
                <Radio className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-medium text-white">Live Radio</h3>
                <p className="text-sm text-neutral-400 mt-1">Join the stream</p>
              </Link>

              <Link
                to="/music-box"
                className="p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors group"
              >
                <Music2 className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="font-medium text-white">Suggestions</h3>
                <p className="text-sm text-neutral-400 mt-1">Request songs</p>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomePage;
