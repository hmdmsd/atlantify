interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  wsUrl: import.meta.env.VITE_WS_URL || "ws://localhost:3000",
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      refresh: "/auth/refresh",
    },
    musicBox: {
      suggestions: "/musicbox/suggestions",
      vote: (id: string) => `/musicbox/suggestions/${id}/vote`,
    },
    radio: {
      queue: "/radio/queue",
      current: "/radio/current",
      next: "/radio/next",
    },
    songs: {
      upload: "/songs/upload",
      list: "/songs",
      details: (id: string) => `/songs/${id}`,
    },
  },
  headers: {
    "Content-Type": "application/json",
  },
};

export class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("auth_token");

    const headers = {
      ...apiConfig.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}
