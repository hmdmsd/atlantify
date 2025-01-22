import React, { useState } from "react";
import { ImageIcon } from "lucide-react";

interface PlaylistModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  initialData?: {
    name: string;
    description: string;
    coverImage: File | null;
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    coverImage: File | null;
  }) => void;
  error?: string | null;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  isEditMode,
  initialData = { name: "", description: "", coverImage: null },
  onClose,
  onSubmit,
  error,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description,
    coverImage: initialData.coverImage,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData.coverImage ? URL.createObjectURL(initialData.coverImage) : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">
          {isEditMode ? "Edit Playlist" : "Create New Playlist"}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter playlist name"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter playlist description"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Cover Image (optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-neutral-500" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="inline-flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg cursor-pointer"
                >
                  Choose Image
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600"
            disabled={!formData.name.trim()}
          >
            {isEditMode ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
