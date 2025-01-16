import React, { useState } from "react";
import {
  Plus,
  ListMusic,
  Music2,
  Edit2,
  Trash2,
  PlayCircle,
  MoreVertical,
} from "lucide-react";

// Mock interfaces (replace with actual types from your API)
interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: number;
  duration: number;
  coverImage?: string;
  creator: string;
}

export const PlaylistsPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: "1",
      name: "Summer Vibes",
      description: "Feel-good tracks for sunny days",
      tracks: 42,
      duration: 3600,
      coverImage: "/api/playlist-covers/summer-vibes.jpg",
      creator: "You",
    },
    {
      id: "2",
      name: "Chill Beats",
      description: "Relaxing electronic and lo-fi",
      tracks: 28,
      duration: 2400,
      creator: "You",
    },
    {
      id: "3",
      name: "Workout Mix",
      description: "High-energy tracks to keep you motivated",
      tracks: 35,
      duration: 2800,
      coverImage: "/api/playlist-covers/workout-mix.jpg",
      creator: "You",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Format duration to hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  };

  // Create new playlist
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist: Playlist = {
        id: (playlists.length + 1).toString(),
        name: newPlaylistName,
        tracks: 0,
        duration: 0,
        creator: "You",
      };
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName("");
      setShowCreateModal(false);
    }
  };

  // Delete playlist
  const handleDeletePlaylist = (id: string) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      setPlaylists(playlists.filter((playlist) => playlist.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <ListMusic className="h-8 w-8 text-blue-500" />
            Playlists
          </h1>
          <p className="mt-2 text-neutral-400">
            Manage and create your music collections
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create New Playlist
            </h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group"
          >
            {/* Playlist Cover */}
            <div className="relative">
              {playlist.coverImage ? (
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-neutral-800 flex items-center justify-center">
                  <Music2 className="w-12 h-12 text-neutral-500" />
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full text-white"
                  title="Play Playlist"
                >
                  <PlayCircle className="w-6 h-6" />
                </button>
                <button
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-full text-neutral-300"
                  title="More Options"
                >
                  <MoreVertical className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Playlist Details */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white truncate">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm text-neutral-400 truncate">
                      {playlist.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-neutral-400 hover:text-white"
                    title="Edit Playlist"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="text-neutral-400 hover:text-red-500"
                    title="Delete Playlist"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Playlist Stats */}
              <div className="flex justify-between text-neutral-400 text-sm mt-3">
                <div className="flex items-center space-x-2">
                  <Music2 className="w-4 h-4" />
                  <span>{playlist.tracks} Tracks</span>
                </div>
                <div>{formatDuration(playlist.duration)}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {playlists.length === 0 && (
          <div className="col-span-full text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
            <ListMusic className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
            <p className="text-neutral-400">
              You haven't created any playlists yet.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
            >
              Create First Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;
