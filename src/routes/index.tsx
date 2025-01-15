import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages
import { LoginPage } from "../pages/Auth/LoginPage";
import { SignUpPage } from "../pages/Auth/SignUpPage";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPasswordPage";
import { HomePage } from "../pages/Home/HomePage";
import { MusicBoxPage } from "../pages/MusicBox/MusicBoxPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { RadioPage } from "../pages/Radio/RadioPage"; // Import the RadioPage
import { QueuePage } from "@/pages/Queue/QueuePage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/music-box" element={<MusicBoxPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/radio" element={<RadioPage />} /> {/* Add Radio Route */}
        <Route path="/queue" element={<QueuePage />} /> {/* Add Radio Route */}
      </Route>

      {/* Catch all - 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">404</h1>
              <p className="mt-2 text-gray-600">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};
