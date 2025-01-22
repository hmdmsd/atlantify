import { apiClient, apiConfig } from "@/config/api.config";
import { Song } from "@/types/song.types";

export const likedSongsService = {
  async getLikedSongs() {
    const response = await apiClient.get<{
      success: boolean;
      songs: Song[];
    }>(apiConfig.endpoints.likedSongs.list);
    return response;
  },

  async toggleLikeSong(songId: string) {
    const response = await apiClient.post<{
      success: boolean;
      liked: boolean;
    }>(apiConfig.endpoints.likedSongs.toggle(songId));
    return response;
  },

  async checkIfLiked(songId: string) {
    const response = await apiClient.get<{
      success: boolean;
      isLiked: boolean;
    }>(apiConfig.endpoints.likedSongs.check(songId));
    return response;
  },

  async getLikedSongIds() {
    const response = await apiClient.get<{
      success: boolean;
      songIds: string[];
    }>(apiConfig.endpoints.likedSongs.getLikedIds);
    return response;
  },
};
