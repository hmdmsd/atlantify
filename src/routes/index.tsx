import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedLayout } from "./ProtectedRoute";

// Pages
import { LoginPage } from "../pages/Auth/LoginPage";
import { SignUpPage } from "../pages/Auth/SignUpPage";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPasswordPage";
import { HomePage } from "../pages/Home/HomePage";
import { MusicBoxPage } from "../pages/MusicBox/MusicBoxPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { RadioPage } from "../pages/Radio/RadioPage";
import { QueuePage } from "../pages/Queue/QueuePage";
import { SearchPage } from "../pages/Search/SearchPage";
import { PlaylistsPage } from "../pages/Playlists/PlaylistsPage";
import { LikedSongsPage } from "../pages/LikedSongs/LikedSongsPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/music-box" element={<MusicBoxPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/radio" element={<RadioPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/liked" element={<LikedSongsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all - 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-500">404</h1>
              <p className="mt-2 text-neutral-400">Page not found</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
