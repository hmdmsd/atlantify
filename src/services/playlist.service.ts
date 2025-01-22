import { apiClient, apiConfig } from "@/config/api.config";
import {
  Playlist,
  PlaylistResponse,
  PlaylistSong,
} from "@/types/playlist.types";

export const playlistService = {
  async getUserPlaylists() {
    const response = await apiClient.get<{
      success: boolean;
      playlists: Playlist[];
    }>(apiConfig.endpoints.playlists.list);
    return response;
  },

  async createPlaylist(data: {
    name: string;
    description?: string;
    coverImage?: File;
  }) {
    try {
      // Ensure name is properly validated
      if (!data.name || data.name.trim() === "") {
        throw new Error("Playlist name is required");
      }

      // For JSON payload
      const jsonPayload = {
        name: data.name.trim(),
        description: data.description?.trim(),
      };

      // If there's a cover image, use FormData
      if (data.coverImage) {
        const formData = new FormData();
        formData.append("name", jsonPayload.name);
        if (jsonPayload.description) {
          formData.append("description", jsonPayload.description);
        }
        formData.append("coverImage", data.coverImage);

        const response = await apiClient.post<PlaylistResponse>(
          apiConfig.endpoints.playlists.create,
          formData
        );

        return response;
      }

      // For JSON-only payload
      const response = await apiClient.post<PlaylistResponse>(
        apiConfig.endpoints.playlists.create,
        jsonPayload
      );

      return response;
    } catch (error) {
      console.error("Playlist creation error:", error);
      throw error;
    }
  },
  async getPlaylistDetails(playlistId: string) {
    const response = await apiClient.get<{
      success: boolean;
      playlist: Playlist;
    }>(apiConfig.endpoints.playlists.details(playlistId));
    return response;
  },

  async updatePlaylist(
    playlistId: string,
    data: {
      name?: string;
      description?: string;
      coverImage?: File;
    }
  ) {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.coverImage) formData.append("coverImage", data.coverImage);

    const response = await apiClient.put<PlaylistResponse>(
      apiConfig.endpoints.playlists.update(playlistId),
      formData
    );
    return response;
  },

  async deletePlaylist(playlistId: string) {
    const response = await apiClient.delete<{ success: boolean }>(
      apiConfig.endpoints.playlists.delete(playlistId)
    );
    return response;
  },

  async addSongToPlaylist(playlistId: string, songId: string) {
    const response = await apiClient.post<{
      success: boolean;
      playlistSong: PlaylistSong;
    }>(apiConfig.endpoints.playlists.addSong(playlistId), { songId });
    return response;
  },

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    const response = await apiClient.delete<{ success: boolean }>(
      apiConfig.endpoints.playlists.removeSong(playlistId, songId)
    );
    return response;
  },

  async updateCover(playlistId: string, coverImage: File) {
    const formData = new FormData();
    formData.append("coverImage", coverImage);

    const response = await apiClient.put<PlaylistResponse>(
      apiConfig.endpoints.playlists.updateCover(playlistId),
      formData
    );
    return response;
  },
};
