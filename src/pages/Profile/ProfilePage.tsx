import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { User, Edit2, Save, X, Calendar, ShieldCheck, Tag } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-70" />
          <p className="text-neutral-400">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Reuse the login function to refresh user data after update
      // In a real app, you'd want a dedicated update profile endpoint
      const success = await login({
        email: editForm.email,
        password: "", // You'd need to handle this differently in a real app
      });

      if (success) {
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <User className="h-8 w-8 text-blue-500" />
          Profile
        </h1>
        <p className="mt-2 text-neutral-400">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Container */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-neutral-400" />
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="block w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="block w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user.username}
                </h2>
                <p className="text-neutral-400">{user.email}</p>
                <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-full transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-neutral-400">Member ID</span>
            </div>
            <div className="text-lg font-semibold text-white truncate">
              {user.id}
            </div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-neutral-400">Role</span>
            </div>
            <div className="text-lg font-semibold text-white capitalize">
              {user.role || "User"}
            </div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span className="text-sm text-neutral-400">Account Status</span>
            </div>
            <div className="text-lg font-semibold text-green-500">Active</div>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
