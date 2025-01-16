import React, { useState, useRef } from "react";
import { Upload, X, FileAudio } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ApiClient, apiConfig } from "@/config/api.config";

interface SongUploadModalProps {
  onClose: () => void;
  onAddTrack: (songId: string) => void;
}

interface SongMetadata {
  title: string;
  artist: string;
  file: File | null;
}

export const SongUploadModal: React.FC<SongUploadModalProps> = ({
  onClose,
  onAddTrack,
}) => {
  const { user } = useAuth();
  const [metadata, setMetadata] = useState<SongMetadata>({
    title: "",
    artist: "",
    file: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["audio/mpeg", "audio/ogg", "audio/wav"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload an MP3, OGG, or WAV file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum file size is 5MB.");
        return;
      }

      setMetadata((prev) => ({ ...prev, file }));
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!metadata.file || !metadata.title || !metadata.artist || !user) {
      setError("All fields are required.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("song", metadata.file);
      formData.append("title", metadata.title);
      formData.append("artist", metadata.artist);

      const apiClient = ApiClient.getInstance();
      const response = await apiClient.post<{ song: { id: string } }>(
        apiConfig.endpoints.songs.upload,
        formData,
        (progress) => setUploadProgress(progress)
      );

      await onAddTrack(response.song.id);
      onClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during upload."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Upload New Track</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-red-500 transition-colors"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".mp3,.ogg,.wav"
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="w-full flex items-center justify-center p-4 border-2 border-dashed border-neutral-700 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50"
          >
            {metadata.file ? (
              <div className="flex items-center gap-2 text-blue-500">
                <FileAudio />
                <span className="truncate max-w-[200px]">
                  {metadata.file.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-400">
                <Upload className="mr-2" />
                <span>Select Audio File</span>
              </div>
            )}
          </button>

          {/* Metadata Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Song Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 disabled:opacity-50"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Artist
              </label>
              <input
                type="text"
                name="artist"
                value={metadata.artist}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 disabled:opacity-50"
                placeholder="Enter artist name"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-center text-neutral-400">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-neutral-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={
              isUploading ||
              !metadata.file ||
              !metadata.title ||
              !metadata.artist
            }
            className={`
              px-4 py-2 rounded-full text-white transition-colors
              ${
                isUploading ||
                !metadata.file ||
                !metadata.title ||
                !metadata.artist
                  ? "bg-blue-500/50 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            {isUploading ? "Uploading..." : "Upload Track"}
          </button>
        </div>
      </div>
    </div>
  );
};
