import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

// Routes
import { AppRoutes } from "./routes";

// Store
import { AppDispatch } from "./store";
import { checkAuth } from "./store/authSlice";
import { fetchQueue } from "./store/radioSlice";

// Services
import { audioService } from "./services/audio.service";
import { radioService } from "./services/radio.service";

// Error Boundary
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Application error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-black text-white px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-blue-400">
              Something Went Wrong
            </h1>
            <p className="text-neutral-400 mb-2">
              An unexpected error has occurred in the application.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-400 mb-6">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-black transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status
        await dispatch(checkAuth()).unwrap();

        // Initialize audio and radio services
        audioService.onError((error) => {
          console.error("Audio error:", error);
        });

        radioService.on("queueUpdate", () => {
          dispatch(fetchQueue());
        });

        // Initial queue fetch
        await dispatch(fetchQueue()).unwrap();
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      audioService.destroy();
      radioService.removeAllListeners();
    };
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default App;
