import { Song } from "./song.types";

export interface SongStats {
  id: string;
  songId: string;
  playCount: number;
  lastPlayedAt?: string;
  song?: Song;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalStats {
  totalPlays: number;
  uniqueListeners: number;
  topGenres: Array<{
    name: string;
    count: number;
  }>;
  topArtists: Array<{
    name: string;
    plays: number;
  }>;
}
