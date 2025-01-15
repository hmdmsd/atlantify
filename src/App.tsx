// App.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRoutes } from "./routes";
import { Header } from "./components/Header";
import { checkAuth } from "./store/authSlice";
import { skipTrack, fetchQueue } from "./store/radioSlice";
import type { AppDispatch, RootState } from "./store";
import { audioService } from "./services/audio.service";
import { radioService } from "./services/radio.service";
import { musicBoxService } from "./services/musicbox.service";
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentTrack, queue } = useSelector(
    (state: RootState) => state.radio
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status
        await dispatch(checkAuth()).unwrap();

        // If authenticated, fetch initial queue
        if (isAuthenticated) {
          await dispatch(fetchQueue()).unwrap();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize services and set up event listeners
    const initializeServices = async () => {
      try {
        // Audio service events
        audioService.onError((error) => {
          console.error("Audio error:", error);
          // You could dispatch to a notification system here
        });

        // Radio service events
        radioService.on("queueUpdate", (newQueue) => {
          dispatch(fetchQueue());
        });

        // MusicBox service events
        musicBoxService.on("connectionError", (error: string) => {
          console.error("MusicBox connection error:", error);
          // Handle connection errors
        });

        // Initial data fetching
        await dispatch(fetchQueue()).unwrap();
      } catch (error) {
        console.error("Service initialization error:", error);
      }
    };

    initializeServices();

    // Cleanup function
    return () => {
      audioService.destroy();
      radioService.removeAllListeners();
      musicBoxService.removeAllListeners();
    };
  }, [dispatch, isAuthenticated]);

  const handleNextTrack = async () => {
    try {
      await dispatch(skipTrack()).unwrap();
    } catch (error) {
      console.error("Failed to skip track:", error);
    }
  };

  const handlePreviousTrack = () => {
    // Implement previous track logic if needed
    console.log("Previous track not implemented");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      {isAuthenticated && <Header />}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <AppRoutes />
      </main>

      {/* Audio Player */}
      {isAuthenticated && (
        <AudioPlayer
          currentTrack={currentTrack}
          onNext={queue.length > 0 ? handleNextTrack : undefined}
          onPrevious={handlePreviousTrack}
        />
      )}

      {/* Toast Container for notifications */}
      <div id="toast-container" className="fixed top-4 right-4 z-50" />
    </div>
  );
};

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Application error:", error);
    console.error("Error info:", info);
    // You could send this to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-2">
              We've encountered an unexpected error.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-600 mb-6">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export wrapped component
const AppWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

export default AppWithErrorBoundary;
