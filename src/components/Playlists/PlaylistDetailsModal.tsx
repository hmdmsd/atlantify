import React from "react";
import { Music2, Heart } from "lucide-react";
import { Playlist } from "@/types/playlist.types";

interface PlaylistDetailsModalProps {
  isOpen: boolean;
  playlist: Playlist | null;
  onClose: () => void;
  formatDuration: (seconds: number) => string;
  getTotalDuration: (songs: any[]) => number;
}

export const PlaylistDetailsModal: React.FC<PlaylistDetailsModalProps> = ({
  isOpen,
  playlist,
  onClose,
  formatDuration,
  getTotalDuration,
}) => {
  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Playlist Details
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Cover and Info */}
          <div>
            <div className="aspect-square bg-neutral-800 rounded-lg overflow-hidden mb-4">
              {playlist.coverImage ? (
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-16 h-16 text-neutral-700" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">
              {playlist.name}
            </h3>
            {playlist.description && (
              <p className="text-neutral-400 mt-1">{playlist.description}</p>
            )}
            <div className="mt-4 text-sm text-neutral-500">
              <p>Created by: {playlist.createdBy}</p>
              <p>
                Created: {new Date(playlist.createdAt).toLocaleDateString()}
              </p>
              <p>{playlist.songs?.length || 0} songs</p>
              <p>
                {formatDuration(getTotalDuration(playlist.songs || []))} total
                length
              </p>
            </div>
          </div>

          {/* Songs List */}
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
            {playlist.songs?.map((playlistSong, index) => (
              <div
                key={playlistSong.id}
                className="flex items-center p-2 hover:bg-neutral-800/50 rounded-lg"
              >
                <span className="text-neutral-500 w-8">{index + 1}</span>
                <div className="flex-1">
                  <p className="text-white">{playlistSong.song?.title}</p>
                  <p className="text-sm text-neutral-400">
                    {playlistSong.song?.artist}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-neutral-400 hover:text-red-500">
                    <Heart className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-neutral-500">
                    {formatDuration(playlistSong.song?.duration || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
