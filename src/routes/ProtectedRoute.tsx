import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer/AudioPlayer";
import { usePlayer } from "@/contexts/PlayerContext";

export const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 fixed left-0 top-0 h-full">
          <Header />
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20">
          <Header />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 relative overflow-y-auto">
          {/* Mobile Header Spacer */}
          <div className="h-16 lg:h-0" />

          {/* Content Container */}
          <div className="container max-w-7xl mx-auto px-4 py-6 pb-32">
            <Outlet />
          </div>

          {/* Audio Player Container */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-64">
            <AudioPlayer />
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <div id="toast-container" className="fixed top-4 right-4 z-50" />
    </div>
  );
};

export default ProtectedLayout;
