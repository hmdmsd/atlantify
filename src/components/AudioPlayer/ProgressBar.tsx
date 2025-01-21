import React from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
  disabled?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  disabled = false,
}) => {
  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center w-full gap-2">
      <span className="text-xs text-neutral-400 w-10 text-right">
        {formatTime(currentTime)}
      </span>
      <div className="relative w-full group">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          disabled={disabled}
          onChange={(e) => !disabled && onSeek(Number(e.target.value))}
          className={`
            w-full h-1 appearance-none bg-neutral-800 rounded-full 
            cursor-pointer relative z-10
            disabled:cursor-not-allowed disabled:opacity-50
            before:absolute before:top-0 before:left-0 before:h-full 
            before:rounded-full before:bg-white
            before:w-[${progress}%]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          `}
          style={{
            background: disabled
              ? `linear-gradient(to right, #525252 ${progress}%, #262626 ${progress}%)`
              : `linear-gradient(to right, #ffffff ${progress}%, #262626 ${progress}%)`,
          }}
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 h-1 w-full 
            bg-neutral-800 rounded-full
          `}
        />
      </div>
      <span className="text-xs text-neutral-400 w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;
