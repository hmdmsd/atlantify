export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  wsUrl: import.meta.env.VITE_WS_URL || "ws://localhost:4000/api",
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      refresh: "/auth/refresh",
      me: "/auth/me",
    },
    musicBox: {
      suggestions: "/musicbox/suggestions",
      vote: (id: string) => `/musicbox/suggestions/${id}/vote`,
    },
    radio: {
      queue: "/radio/queue",
      addToQueue: "/radio/queue",
      removeFromQueue: (id: string) => `/radio/queue/${id}`,
      skip: "/radio/skip",
      history: "/radio/history",
    },
    songs: {
      upload: "/songs/upload",
      list: "/songs",
      details: (id: string) => `/songs/${id}`,
    },
    profile: {
      base: "/profile",
      activities: "/profile/activities",
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
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const token = localStorage.getItem("auth_token");
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(!isFormData ? apiConfig.headers : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // If onProgress is provided and it's a POST/PUT with FormData, use XMLHttpRequest
    if (
      onProgress &&
      isFormData &&
      (options.method === "POST" || options.method === "PUT")
    ) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || "POST", `${apiConfig.baseUrl}${endpoint}`);

        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });

        // Progress tracking
        xhr.upload.onprogress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (error) {
              reject(new Error("Failed to parse response"));
            }
          } else {
            reject(new Error(`Request failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.send(options.body);
      });
    }

    // Fallback to fetch for other cases
    const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Update post method to support progress tracking
  async post<T>(
    endpoint: string,
    data?: unknown,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const isFormData = data instanceof FormData;

    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: isFormData ? (data as FormData) : JSON.stringify(data),
      },
      onProgress
    );
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
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
