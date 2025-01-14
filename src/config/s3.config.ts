export const s3Config = {
  bucket: "atlantify.deuxfleurs.fr",
  region: "eu-west-1",
  endpoint: "https://garage.deuxfleurs.fr",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedAudioTypes: ["audio/mpeg", "audio/ogg", "audio/wav"],
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
