import React, { useState, useEffect } from "react";
import { ListMusic, Play, Trash2, Search } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { playlistService } from "@/services/playlist.service";
import { usePlayer } from "@/contexts/PlayerContext";
import { AddSongsModal } from "@/components/Playlists/AddSongsModal";
import { Playlist, PlaylistSong } from "@/types/playlist.types";
import { Song } from "@/types/song.types";
import { apiClient, apiConfig } from "@/config/api.config";

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playMultiple } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      setIsLoading(true);
      if (!id) {
        throw new Error("Playlist ID is required");
      }
      const response = await playlistService.getPlaylistDetails(id);
      if (response.success) {
        setPlaylist(response.playlist);
      }
    } catch (err) {
      setError("Failed to fetch playlist details");
      console.error("Error fetching playlist details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPlaylist = () => {
    if (!playlist?.songs?.length) return;

    const tracks = playlist.songs.map((song) => ({
      id: song.song!.id,
      title: song.song!.title,
      artist: song.song!.artist,
      url: song.song!.publicUrl || song.song!.path,
      duration: song.song!.duration,
    }));

    playMultiple(tracks);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;

    try {
      await playlistService.removeSongFromPlaylist(id, songId);
      await fetchPlaylistDetails();
    } catch (err) {
      setError("Failed to remove song from playlist");
      console.error("Error removing song:", err);
    }
  };

  const handleAddSongs = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; songs: Song[] }>(
        apiConfig.endpoints.songs.list
      );

      if (response.success) {
        // Exclude songs already in the playlist
        const playlistSongIds = new Set(
          playlist?.songs?.map((s) => s.songId) || []
        );

        const filteredSongs = response.songs.filter(
          (song: any) => !playlistSongIds.has(song.id)
        );

        setAvailableSongs(filteredSongs);
        setShowAddSongsModal(true);
      } else {
        setError("Failed to fetch available songs");
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      setError("Failed to fetch available songs");
    }
  };

  const handleAddSelectedSongs = async (songIds: string[]) => {
    if (!id) return;

    try {
      const promises = songIds.map((songId) =>
        playlistService.addSongToPlaylist(id, songId)
      );

      await Promise.all(promises);
      await fetchPlaylistDetails();
      setShowAddSongsModal(false);
    } catch (error) {
      console.error("Error adding songs:", error);
      setError("Failed to add songs to playlist");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id) return;

    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    try {
      await playlistService.deletePlaylist(id);
      navigate("/playlists");
    } catch (err) {
      setError("Failed to delete playlist");
      console.error("Error deleting playlist:", err);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  };

  const getTotalDuration = (songs: PlaylistSong[]) => {
    return songs.reduce((total, song) => total + (song.song?.duration || 0), 0);
  };

  const filteredSongs = playlist?.songs?.filter(
    (playlistSong) =>
      playlistSong.song?.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      playlistSong.song?.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ListMusic className="w-12 h-12 animate-pulse text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        {error}
        <button
          onClick={() => navigate("/playlists")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Playlists
        </button>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Playlist Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-neutral-800 rounded-lg flex items-center justify-center">
              <ListMusic className="w-12 h-12 text-neutral-500" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-neutral-400 mt-1">{playlist.description}</p>
            )}
            <div className="text-neutral-500 text-sm mt-2">
              {playlist.songs?.length || 0} songs •{" "}
              {formatDuration(getTotalDuration(playlist.songs || []))}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePlayPlaylist}
            disabled={!playlist.songs?.length}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Play All
          </button>
          <button
            onClick={handleAddSongs}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full"
          >
            Add Songs
          </button>
          <div className="dropdown">
            <button
              onClick={handleDeletePlaylist}
              className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search songs in playlist..."
          className="w-full px-4 py-2 pl-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        {filteredSongs?.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            No songs in this playlist
          </div>
        ) : (
          filteredSongs?.map((playlistSong, index) => (
            <div
              key={playlistSong.id}
              className="flex items-center justify-between p-3 hover:bg-neutral-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span className="text-neutral-500 w-8">{index + 1}</span>
                <div>
                  <p className="text-white">{playlistSong.song?.title}</p>
                  <p className="text-neutral-400 text-sm">
                    {playlistSong.song?.artist}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-neutral-500">
                  {formatDuration(playlistSong.song?.duration || 0)}
                </span>
                <button
                  onClick={() => handleRemoveSong(playlistSong.songId)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Songs Modal */}
      <AddSongsModal
        isOpen={showAddSongsModal}
        playlistId={id || ""} // Pass the playlist ID
        availableSongs={availableSongs}
        onClose={() => setShowAddSongsModal(false)}
        onAddSongs={handleAddSelectedSongs}
        formatDuration={formatDuration}
      />
    </div>
  );
};
