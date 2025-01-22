import { SongStats } from "./stats.types";

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  path: string;
  publicUrl?: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  stats?: SongStats;
  isLiked?: boolean;
}
