import React, { useState, useEffect } from "react";
import { ListMusic, Play, Pause, Trash2, Music2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { playlistService } from "@/services/playlist.service";
import { usePlayer } from "@/contexts/PlayerContext";
import { AddSongsModal } from "@/components/Playlists/AddSongsModal";
import { Playlist, PlaylistSong } from "@/types/playlist.types";
import { Song } from "@/types/song.types";
import { apiClient, apiConfig } from "@/config/api.config";
import { songStatsService } from "@/services/song-stats.service";

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, play, pause, playMultiple } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const getTrackData = (playlistSong: PlaylistSong) => {
    if (!playlistSong.song) return null;
    const song = playlistSong.song;

    // Ensure we have a valid URL
    const url = song.publicUrl || song.path;
    if (!url) return null;

    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      url: url,
      duration: song.duration,
    };
  };

  const handlePlayAll = () => {
    if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

    const tracks = playlist.songs
      .filter(
        (
          playlistSong
        ): playlistSong is PlaylistSong & {
          song: NonNullable<PlaylistSong["song"]>;
        } =>
          !!playlistSong.song &&
          (!!playlistSong.song.path || !!playlistSong.song.publicUrl)
      )
      .map((playlistSong) => ({
        id: playlistSong.song.id,
        title: playlistSong.song.title,
        artist: playlistSong.song.artist,
        duration: playlistSong.song.duration,
        url: playlistSong.song.publicUrl || playlistSong.song.path,
      }));

    if (tracks.length > 0) {
      playMultiple(tracks);
    }
  };
  const handleTogglePlay = async (playlistSong: PlaylistSong) => {
    const trackData = getTrackData(playlistSong);
    if (!trackData) return;

    try {
      if (currentTrack?.id === trackData.id) {
        if (isPlaying) {
          pause();
        } else {
          await play(trackData);
        }
      } else {
        await play(trackData);
        await songStatsService.incrementPlayCount(trackData.id);
      }
    } catch (err) {
      console.error("Error handling playback:", err);
      setError("Failed to play the track. Please try again.");
    }
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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

  const songCount = playlist.songs?.length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
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
              {songCount} songs
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {songCount > 0 && (
            <>
              <span className="text-neutral-400">{songCount} songs</span>
              <button
                onClick={handlePlayAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
              >
                Play All
              </button>
            </>
          )}
          <button
            onClick={handleAddSongs}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full"
          >
            Add Songs
          </button>
          <button
            onClick={handleDeletePlaylist}
            className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {!songCount ? (
          <div className="text-center py-12 text-neutral-500">
            <ListMusic className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
            <p>No songs in this playlist</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {playlist.songs?.map((playlistSong) => (
              <div
                key={playlistSong.id}
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
                    {playlistSong.song?.title}
                  </h3>
                  <p className="text-sm text-neutral-400 truncate">
                    {playlistSong.song?.artist}
                  </p>
                </div>

                {/* Duration */}
                <div className="text-neutral-400 text-sm mr-4">
                  {formatDuration(playlistSong.song?.duration || 0)}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePlay(playlistSong)}
                    className="text-neutral-400 hover:text-blue-500 transition-colors"
                    title={
                      currentTrack?.id === playlistSong.song?.id && isPlaying
                        ? "Pause"
                        : "Play"
                    }
                  >
                    {currentTrack?.id === playlistSong.song?.id && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveSong(playlistSong.songId)}
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Songs Modal */}
      <AddSongsModal
        isOpen={showAddSongsModal}
        playlistId={id || ""}
        availableSongs={availableSongs}
        onClose={() => setShowAddSongsModal(false)}
        onAddSongs={handleAddSelectedSongs}
        formatDuration={formatDuration}
      />
    </div>
  );
};
