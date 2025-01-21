import React from "react";
import { Clock, User, Trash2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  addedBy: {
    id: string;
    username: string;
  };
  addedAt: string;
}

interface QueueItemProps {
  track: Track;
  isCurrentTrack: boolean;
  position: number;
  onRemove?: () => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  track,
  isCurrentTrack,
  position,
  onRemove,
}) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`
        p-4 border-b last:border-b-0 transition-colors
        ${isCurrentTrack ? "bg-blue-50" : "hover:bg-gray-50"}
        flex items-center justify-between
      `}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 text-center font-medium text-gray-500">
          {position}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{track.title}</h4>
            {isCurrentTrack && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                Now Playing
              </span>
            )}
          </div>
          <p className="text-gray-600">{track.artist}</p>

          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(track.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{track.addedBy.username}</span>
            </div>
            <div>Added at {formatTime(track.addedAt)}</div>
          </div>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition-colors ml-4"
          title="Remove from queue"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
