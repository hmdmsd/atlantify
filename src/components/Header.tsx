import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Music2,
  Radio,
  ListMusic,
  User,
  LogOut,
  HomeIcon,
  Search,
  Heart,
  Settings,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      label: "Home",
      path: "/",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      label: "Search",
      path: "/search",
      icon: <Search className="w-5 h-5" />,
    },
    {
      label: "Music Box",
      path: "/music-box",
      icon: <Music2 className="w-5 h-5" />,
    },
    {
      label: "Radio",
      path: "/radio",
      icon: <Radio className="w-5 h-5" />,
    },
    {
      label: "Playlists",
      path: "/playlists",
      icon: <ListMusic className="w-5 h-5" />,
    },
  ];

  const additionalNavItems: NavItem[] = [
    {
      label: "Liked Songs",
      path: "/liked",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const renderNavLink = (item: NavItem, isAdditional: boolean = false) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      key={item.path}
    >
      <Link
        to={item.path}
        className={`
          flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out
          ${
            location.pathname === item.path
              ? "bg-neutral-800 text-blue-500 shadow-md"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
          }
          ${isAdditional ? "text-sm" : ""}
        `}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="h-full flex flex-col bg-neutral-900/90 backdrop-blur-xl border-r border-neutral-800/50 shadow-2xl">
        {/* Logo Section */}
        <Link
          to="/"
          className="p-6 pb-8 flex items-center gap-3 border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Atlantify</h1>
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => renderNavLink(item))}
        </nav>

        {/* Additional Navigation */}
        <div className="px-4 pb-6 space-y-2 border-t border-neutral-800/50">
          {additionalNavItems.map((item) => renderNavLink(item, true))}
        </div>

        {/* User Profile Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 border-t border-neutral-800/50 bg-neutral-900/50"
          >
            <div className="flex items-center justify-between text-neutral-400">
              <Link
                to="/profile"
                className="flex items-center gap-3 hover:text-white transition-colors group"
              >
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                  <User className="w-6 h-6 text-neutral-300 group-hover:text-white" />
                </div>
                <div>
                  <span className="font-medium text-white block group-hover:text-blue-400 transition-colors">
                    {user.username}
                  </span>
                  <span className="text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors">
                    Free Account
                  </span>
                </div>
              </Link>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-neutral-800 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Header;
