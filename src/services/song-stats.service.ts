import { apiClient, apiConfig } from "@/config/api.config";
import { Song } from "@/types/song.types";
import { SongStats } from "@/types/stats.types";

export const songStatsService = {
  async getMostPlayedSongs(limit?: number) {
    const endpoint = limit
      ? `${apiConfig.endpoints.stats.mostPlayed}?limit=${limit}`
      : apiConfig.endpoints.stats.mostPlayed;

    const response = await apiClient.get<{
      success: boolean;
      songs: Song[];
    }>(endpoint);
    return response;
  },

  async getRecentlyPlayed(limit?: number) {
    const endpoint = limit
      ? `${apiConfig.endpoints.stats.recentlyPlayed}?limit=${limit}`
      : apiConfig.endpoints.stats.recentlyPlayed;

    const response = await apiClient.get<{
      success: boolean;
      songs: Song[];
    }>(endpoint);
    return response;
  },

  async incrementPlayCount(songId: string) {
    const response = await apiClient.post<{
      success: boolean;
      stats: SongStats;
    }>(apiConfig.endpoints.stats.incrementPlay(songId));
    return response;
  },

  async getSongStats(songId: string) {
    const response = await apiClient.get<{
      success: boolean;
      stats: SongStats;
    }>(apiConfig.endpoints.stats.songStats(songId));
    return response;
  },

  async getTopCharts() {
    const response = await apiClient.get<{
      success: boolean;
      songs: Song[];
    }>(apiConfig.endpoints.stats.topCharts);
    return response;
  },

  async getTrendingSongs() {
    const response = await apiClient.get<{
      success: boolean;
      songs: Song[];
    }>(apiConfig.endpoints.stats.trending);
    return response;
  },

  async getUserHistory() {
    const response = await apiClient.get<{
      success: boolean;
      songs: Song[];
    }>(apiConfig.endpoints.stats.userHistory);
    return response;
  },

  async getGlobalStats() {
    const response = await apiClient.get<{
      success: boolean;
      stats: {
        totalPlays: number;
        uniqueListeners: number;
        topGenres: { name: string; count: number }[];
        topArtists: { name: string; plays: number }[];
      };
    }>(apiConfig.endpoints.stats.globalStats);
    return response;
  },
};
