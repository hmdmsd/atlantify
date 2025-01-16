import React, { useState, useMemo, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Hooks
import { useAuth } from "../hooks/useAuth";

// Components
import { Header } from "../components/Header";
import { AudioPlayer } from "../components/AudioPlayer/AudioPlayer";

// Store
import { RootState, AppDispatch } from "../store";
import { skipTrack } from "../store/radioSlice";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTrack, queue } = useSelector(
    (state: RootState) => state.radio
  );

  // Fallback track (memoized to prevent unnecessary rerenders)
  const fallbackTrack = useMemo(
    () => ({
      id: "fallback",
      title: "No track selected",
      artist: "Unknown artist",
      url: "",
    }),
    []
  );

  // State for audio player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Memoized handlers to maintain consistent hook calls
  const handleNextTrack = useCallback(async () => {
    try {
      await dispatch(skipTrack()).unwrap();
    } catch (error) {
      console.error("Failed to skip track:", error);
    }
  }, [dispatch]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleMetadataLoaded = useCallback((trackDuration: number) => {
    setDuration(trackDuration);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Navigation */}
      <Header />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col overflow-hidden">
        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-900 to-black">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Audio Player - Fixed at Bottom */}

        <div className="border-t border-neutral-800 bg-neutral-900">
          <AudioPlayer
            currentTrack={currentTrack || fallbackTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            onPlayPause={togglePlayPause}
            onNext={queue.length > 0 ? handleNextTrack : undefined}
            onPrevious={() => console.log("Previous track not implemented")}
            onMetadataLoaded={handleMetadataLoaded}
          />
        </div>
      </div>

      {/* Toast Container */}
      <div id="toast-container" className="fixed top-4 right-4 z-50" />
    </div>
  );
};
