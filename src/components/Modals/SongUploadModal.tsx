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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Upload New Track</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
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
            className="w-full flex items-center justify-center p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {metadata.file ? (
              <div className="flex items-center gap-2">
                <FileAudio className="text-blue-500" />
                <span>{metadata.file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="mr-2" />
                <span>Select Audio File</span>
              </>
            )}
          </button>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Song Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist
              </label>
              <input
                type="text"
                name="artist"
                value={metadata.artist}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Enter artist name"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-center text-gray-600">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
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
              px-4 py-2 rounded-lg text-white 
              ${
                isUploading ||
                !metadata.file ||
                !metadata.title ||
                !metadata.artist
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
