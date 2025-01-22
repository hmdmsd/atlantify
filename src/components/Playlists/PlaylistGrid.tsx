import React from "react";
import {
  Music2,
  PlayCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Loader,
  ListMusic,
} from "lucide-react";
import { Playlist, PlaylistSong } from "@/types/playlist.types";

interface PlaylistGridProps {
  playlists: Playlist[];
  isLoading: boolean;
  onPlayPlaylist: (playlist: Playlist) => void;
  onEditClick: (playlist: Playlist) => void;
  onDeletePlaylist: (id: string) => void;
  onCreatePlaylist: () => void;
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
};

const getTotalDuration = (songs: PlaylistSong[]) => {
  return songs.reduce((total, song) => total + (song.song?.duration || 0), 0);
};

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  isLoading,
  onPlayPlaylist,
  onEditClick,
  onDeletePlaylist,
  onCreatePlaylist,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
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
                onClick={() => onPlayPlaylist(playlist)}
                className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full text-white"
                title="Play Playlist"
                disabled={!playlist.songs?.length}
              >
                <PlayCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => {}}
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
                  onClick={() => onEditClick(playlist)}
                  className="text-neutral-400 hover:text-white"
                  title="Edit Playlist"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeletePlaylist(playlist.id)}
                  className="text-neutral-400 hover:text-red-500"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Playlist Stats */}
            <div className="flex justify-between text-neutral-400 text-sm mt-3">
              <div className="flex items-center space-x-2">
                <Music2 className="w-4 h-4" />
                <span>{playlist.songs?.length || 0} Tracks</span>
              </div>
              <div>
                {formatDuration(getTotalDuration(playlist.songs || []))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {!isLoading && playlists.length === 0 && (
        <div className="col-span-full text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
          <ListMusic className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
          <p className="text-neutral-400">
            You haven't created any playlists yet.
          </p>
          <button
            onClick={onCreatePlaylist}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
          >
            Create First Playlist
          </button>
        </div>
      )}
    </div>
  );
};
