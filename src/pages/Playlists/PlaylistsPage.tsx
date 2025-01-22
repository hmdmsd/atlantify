import React, { useState, useEffect, useRef } from "react";
import {
  ListMusic,
  Plus,
  Loader,
  PlayCircle,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import { playlistService } from "@/services/playlist.service";
import { Playlist, PlaylistSong } from "@/types/playlist.types";
import { PlaylistModal } from "@/components/Playlists/PlaylistModal";

export const PlaylistsPage: React.FC = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showContextMenu, setShowContextMenu] = useState(false);

  // Selected playlist and related states
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const {} = usePlayer();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await playlistService.getUserPlaylists();
      if (response.success) {
        setPlaylists(response.playlists);
      }
    } catch (err) {
      setError("Failed to fetch playlists");
      console.error("Error fetching playlists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async (data: {
    name: string;
    description?: string;
    coverImage?: File | null;
  }) => {
    try {
      setError(null);

      if (!data.name || data.name.trim() === "") {
        setError("Playlist name is required");
        return;
      }

      const response = await playlistService.createPlaylist({
        name: data.name.trim(),
        description: data.description?.trim(),
        coverImage: data.coverImage || undefined,
      });

      if (response.success) {
        setPlaylists((prev) => [...prev, response.playlist]);
        setShowCreateModal(false);
      } else {
        // Handle specific error cases
        if (response.message === "User not found") {
          setError("Please log in again to create a playlist");
          // Optionally force re-authentication
          // logout(); // If you have a logout function
          return;
        }
        setError(response.message || "Failed to create playlist");
      }
    } catch (err) {
      console.error("Create playlist error:", err);
      if (err instanceof Error) {
        if (
          err.message === "Authentication required" ||
          err.message === "Please log in again to create a playlist"
        ) {
          setError("Please log in again to create a playlist");
          // Optionally force re-authentication
          return;
        }
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    try {
      setError(null);
      const response = await playlistService.deletePlaylist(id);
      if (response.success) {
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      setError("Failed to delete playlist");
      console.error("Error deleting playlist:", err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, playlist: Playlist) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedPlaylist(playlist);
    setShowContextMenu(true);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  };

  const getTotalDuration = (songs: PlaylistSong[]) => {
    return songs.reduce((total, song) => total + (song.song?.duration || 0), 0);
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center text-neutral-400">
          <ListMusic className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
          <p>Please log in to view your playlists</p>
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Playlist Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group relative"
            >
              {/* Playlist Cover */}
              <div
                onClick={() => navigate(`/playlists/${playlist.id}`)}
                className="cursor-pointer"
              >
                {playlist.coverImage ? (
                  <img
                    src={playlist.coverImage}
                    alt={playlist.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-neutral-800 flex items-center justify-center">
                    <ListMusic className="w-12 h-12 text-neutral-500" />
                  </div>
                )}
              </div>

              {/* Playlist Details */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => navigate(`/playlists/${playlist.id}`)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-white truncate">
                      {playlist.name}
                    </h3>
                    {playlist.description && (
                      <p className="text-sm text-neutral-400 truncate">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleContextMenu(e, playlist)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Playlist Stats */}
                <div className="flex justify-between text-neutral-400 text-sm mt-3">
                  <div>{playlist.songs?.length || 0} Tracks</div>
                  <div>
                    {formatDuration(getTotalDuration(playlist.songs || []))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      <PlaylistModal
        isOpen={showCreateModal}
        isEditMode={false}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePlaylist}
        error={error}
      />

      {/* Context Menu */}
      {showContextMenu && selectedPlaylist && (
        <div
          ref={contextMenuRef}
          style={{
            position: "fixed",
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
          }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 py-1 min-w-[200px]"
        >
          <button
            onClick={() => navigate(`/playlists/${selectedPlaylist.id}`)}
            className="w-full px-4 py-2 text-left text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            View Playlist
          </button>
          <button
            onClick={() => {
              setSelectedPlaylist(selectedPlaylist);
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Playlist
          </button>
          <button
            onClick={() => {
              handleDeletePlaylist(selectedPlaylist.id);
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-neutral-300 hover:bg-neutral-800 flex items-center gap-2 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
            Delete Playlist
          </button>
        </div>
      )}
    </div>
  );
};
