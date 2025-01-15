import { ApiClient } from "../config/api.config";
import { EventEmitter } from "events";
import { s3Config } from "../config/s3.config";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface FileMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface StorageQuota {
  used: number;
  total: number;
  remaining: number;
}

class StorageService extends EventEmitter {
  private static instance: StorageService;
  private api: ApiClient;
  private uploadQueue: Map<
    string,
    { xhr: XMLHttpRequest; cancel: () => void }
  > = new Map();

  private constructor() {
    super();
    this.api = ApiClient.getInstance();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    // Validate file
    this.validateFile(file);

    // Generate upload ID
    const uploadId = crypto.randomUUID();

    try {
      // Get pre-signed URL
      const { url, fields } = await this.getUploadUrl(file.name, file.type);

      // Create form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);

      // Upload file
      const metadata = await this.uploadToS3(
        uploadId,
        url,
        formData,
        onProgress
      );

      // Update file registry
      return await this.registerUploadedFile(metadata);
    } catch (error) {
      this.uploadQueue.delete(uploadId);
      throw this.handleError(error);
    }
  }

  public async downloadFile(fileId: string): Promise<Blob> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      const response = await fetch(metadata.url);

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      return await response.blob();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async deleteFile(fileId: string): Promise<void> {
    try {
      await this.api.delete(`/storage/files/${fileId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public cancelUpload(uploadId: string): void {
    const upload = this.uploadQueue.get(uploadId);
    if (upload) {
      upload.cancel();
      this.uploadQueue.delete(uploadId);
    }
  }

  public async getStorageQuota(): Promise<StorageQuota> {
    try {
      return await this.api.get<StorageQuota>("/storage/quota");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getFileMetadata(fileId: string): Promise<FileMetadata> {
    try {
      return await this.api.get<FileMetadata>(`/storage/files/${fileId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async getUploadUrl(
    filename: string,
    contentType: string
  ): Promise<{ url: string; fields: Record<string, string> }> {
    try {
      return await this.api.post("/storage/upload-url", {
        filename,
        contentType,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private uploadToS3(
    uploadId: string,
    url: string,
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const cancel = () => {
        xhr.abort();
        reject(new Error("Upload cancelled"));
      };

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress?.(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const location = xhr.getResponseHeader("Location");
          resolve({
            id: uploadId,
            filename: formData.get("key") as string,
            url: location || url + formData.get("key"),
            size: (formData.get("file") as File).size,
            mimeType: (formData.get("file") as File).type,
            uploadedBy: "current-user-id", // This should come from auth context
            uploadedAt: new Date().toISOString(),
          });
        } else {
          reject(new Error("Upload failed"));
        }
        this.uploadQueue.delete(uploadId);
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
        this.uploadQueue.delete(uploadId);
      });

      xhr.open("POST", url, true);
      xhr.send(formData);

      this.uploadQueue.set(uploadId, { xhr, cancel });
    });
  }

  private async registerUploadedFile(
    metadata: FileMetadata
  ): Promise<FileMetadata> {
    try {
      return await this.api.post("/storage/files", metadata);
    } catch (error) {
      // If registration fails, try to delete the uploaded file
      await this.deleteFile(metadata.id).catch(console.error);
      throw this.handleError(error);
    }
  }

  private validateFile(file: File): void {
    // Check file size
    if (file.size > s3Config.maxFileSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${
          s3Config.maxFileSize / (1024 * 1024)
        }MB`
      );
    }

    // Check file type
    if (!s3Config.allowedAudioTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }
  }

  public async cleanupStorage(): Promise<void> {
    try {
      await this.api.post("/storage/cleanup");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "string") {
      return new Error(error);
    }

    return new Error("An unknown error occurred in storage service");
  }

  // Utility methods
  public getFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  public getMimeTypeIcon(mimeType: string): string {
    const mimeIcons: Record<string, string> = {
      "audio/mpeg": "🎵",
      "audio/ogg": "🎵",
      "audio/wav": "🎵",
      // Add more mime type icons as needed
    };
    return mimeIcons[mimeType] || "📄";
  }
}

export const storageService = StorageService.getInstance();
