/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_S3_ACCESS_KEY: string;
  readonly VITE_S3_SECRET_KEY: string;
  readonly VITE_S3_ENDPOINT: string;
  readonly VITE_S3_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
