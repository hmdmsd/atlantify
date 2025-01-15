export const s3Config = {
  endpoint: "https://garage.deuxfleurs.fr",
  bucket: "atlantify",
  accessKeyId: "GKa8bf55babca0f2e4c588c7b6",
  secretAccessKey:
    "d3a330bd1dd024c2053292cba525bac007075f2bd1d8a3b8c7fa9036976e6d92",
  maxFileSize: 10 * 1024 * 1024, // Maximum file size in bytes (10 MB)
  allowedAudioTypes: ["audio/mp3", "audio/ogg", "audio/wav"],
};

export interface S3Response {
  url: string;
  key: string;
}

export class S3Manager {
  private static instance: S3Manager;

  private constructor() {}

  static getInstance(): S3Manager {
    if (!S3Manager.instance) {
      S3Manager.instance = new S3Manager();
    }
    return S3Manager.instance;
  }

  async uploadFile(file: File, path: string): Promise<S3Response> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${s3Config.endpoint}/upload/${path}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return {
      url: `${s3Config.endpoint}/${data.key}`,
      key: data.key,
    };
  }
}
