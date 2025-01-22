import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer/AudioPlayer";
import { GlobalSongSearch } from "@/components/GlobalSongSearch";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-neutral-900">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-900 text-white flex">
      {/* Mobile Sidebar Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-neutral-800/60 backdrop-blur-md p-2 rounded-full shadow-lg"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.button>

      {/* Sidebar - Mobile and Desktop */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{
              x: window.innerWidth < 1024 ? -300 : 0,
              opacity: window.innerWidth < 1024 ? 0 : 1,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: -300,
              opacity: 0,
            }}
            transition={{ type: "tween" }}
            className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-neutral-900/90 backdrop-blur-xl 
              transform transition-transform duration-300 ease-in-out
              lg:translate-x-0 shadow-2xl
            `}
          >
            <Header />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 relative overflow-y-auto">
        {/* Top Bar with Global Search */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-20 bg-neutral-900/60 backdrop-blur-xl shadow-lg"
        >
          <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <GlobalSongSearch />
            </div>
          </div>
        </motion.div>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="container max-w-7xl mx-auto px-4 py-6 pb-32 space-y-6"
        >
          <Outlet />
        </motion.div>

        {/* Audio Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 lg:left-64 z-30"
        >
          <AudioPlayer />
        </motion.div>
      </main>

      {/* Toast Container */}
      <div
        id="toast-container"
        className="fixed top-4 right-4 z-50 space-y-4"
      />
    </div>
  );
};

export default ProtectedLayout;
