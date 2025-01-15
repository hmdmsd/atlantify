import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Music2, Radio, ListMusic, User, LogOut } from "lucide-react";
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
      label: "Queue",
      path: "/queue",
      icon: <ListMusic className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-500"
          >
            <Music2 className="w-6 h-6" />
            <span>Atlantify</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-colors hover:bg-gray-50
                  ${
                    location.pathname === item.path
                      ? "text-blue-500 bg-blue-50"
                      : "text-gray-600"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 px-4 py-3
                ${
                  location.pathname === item.path
                    ? "text-blue-500"
                    : "text-gray-600"
                }
              `}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
