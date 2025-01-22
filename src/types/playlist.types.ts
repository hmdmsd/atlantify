import { Song } from "./song.types";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdBy: string;
  songs?: PlaylistSong[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  addedBy: string;
  song?: Song;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistResponse {
  success: boolean;
  playlist: Playlist;
  message?: string;
}
