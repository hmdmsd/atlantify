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

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-neutral-900 hidden lg:flex flex-col shadow-lg">
      {/* Logo */}
      <Link
        to="/"
        className="p-6 pb-8 flex items-center gap-2 border-b border-neutral-900"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
              ${
                location.pathname === item.path
                  ? "bg-neutral-900 text-blue-500"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
              }
            `}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Additional Navigation */}
      <div className="px-4 pb-6 space-y-2 border-t border-neutral-900">
        {additionalNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
              ${
                location.pathname === item.path
                  ? "bg-neutral-900 text-blue-500"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
              }
            `}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-neutral-900">
          <div className="flex items-center justify-between text-neutral-400">
            <Link
              to="/profile"
              className="flex items-center gap-3 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-neutral-300" />
              </div>
              <div>
                <span className="font-medium text-white block">
                  {user.username}
                </span>
                <span className="text-sm text-neutral-500">Free Account</span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-neutral-900 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
