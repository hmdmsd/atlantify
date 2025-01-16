import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Palette,
  Cast,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedSection, setSelectedSection] = useState("profile");

  // Form state
  const [profileSettings, setProfileSettings] = useState({
    username: user?.username || "",
    email: user?.email || "",
    profilePicture: null as File | null,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
  });

  const settingsSections = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Control how you receive updates",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Lock,
      description: "Manage your data and visibility",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Customize your app look",
    },
    {
      id: "streaming",
      label: "Streaming",
      icon: Cast,
      description: "Audio quality and device settings",
    },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Profile Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Username
          </label>
          <input
            type="text"
            value={profileSettings.username}
            onChange={(e) =>
              setProfileSettings((prev) => ({
                ...prev,
                username: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Email
          </label>
          <input
            type="email"
            value={profileSettings.email}
            onChange={(e) =>
              setProfileSettings((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">
        Notification Preferences
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Email Notifications</h3>
            <p className="text-neutral-400 text-sm">
              Receive updates and recommended tracks via email
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={() =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailNotifications: !prev.emailNotifications,
                }))
              }
              className="hidden"
            />
            <div
              className={`
              w-12 h-6 rounded-full relative transition-colors duration-300
              ${
                notificationSettings.emailNotifications
                  ? "bg-blue-500"
                  : "bg-neutral-700"
              }
            `}
            >
              <div
                className={`
                absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full 
                transition-transform duration-300
                ${
                  notificationSettings.emailNotifications
                    ? "translate-x-[22px]"
                    : "translate-x-[2px]"
                }
              `}
              ></div>
            </div>
          </label>
        </div>

        {/* Similar toggle components for other notification types */}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-500" />
            Settings
          </h1>
          <p className="mt-2 text-neutral-400">
            Customize your Atlantify experience
          </p>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <nav className="space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-left
                  transition-colors
                  ${
                    selectedSection === section.id
                      ? "bg-blue-500/20 text-blue-500"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }
                `}
              >
                <section.icon className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">{section.label}</h3>
                  <p className="text-xs text-neutral-500">
                    {section.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-6 border-t border-neutral-800 pt-4">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          {selectedSection === "profile" && renderProfileSection()}
          {selectedSection === "notifications" && renderNotificationsSection()}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
