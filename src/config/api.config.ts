export const apiConfig = {
  baseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    "https://atlantify-backend-production.up.railway.app/api",
  wsUrl:
    import.meta.env.VITE_WS_URL ||
    "https://atlantify-backend-production.up.railway.app/api",
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
      toggleVote: (id: string) => `/musicbox/suggestions/${id}/toggle-vote`,
      getSuggestion: (id: string) => `/musicbox/suggestions/${id}`,
      createSuggestion: "/musicbox/suggestions",
      deleteSuggestion: (id: string) => `/musicbox/suggestions/${id}`,
      updateStatus: (id: string) => `/musicbox/suggestions/${id}/status`,
    },
    playlists: {
      list: "/playlists",
      create: "/playlists",
      details: (id: string) => `/playlists/${id}`,
      update: (id: string) => `/playlists/${id}`,
      delete: (id: string) => `/playlists/${id}`,
      // Playlist songs management
      addSong: (id: string) => `/playlists/${id}/songs`,
      removeSong: (playlistId: string, songId: string) =>
        `/playlists/${playlistId}/songs/${songId}`,
      // Additional playlist functionality
      getUserPlaylists: "/playlists",
      updateCover: (id: string) => `/playlists/${id}/cover`,
    },
    likedSongs: {
      list: "/liked-songs",
      toggle: (songId: string) => `/liked-songs/${songId}/toggle`,
      check: (songId: string) => `/liked-songs/${songId}/check`,
      getLikedIds: "/liked-songs/ids",
    },
    stats: {
      mostPlayed: "/stats/most-played",
      recentlyPlayed: "/stats/recently-played",
      songStats: (id: string) => `/stats/${id}`,
      incrementPlay: (id: string) => `/stats/${id}/increment-play`,
      // Additional stats endpoints
      topCharts: "/stats/top-charts",
      trending: "/stats/trending",
      userHistory: "/stats/user-history",
      globalStats: "/stats/global",
    },
    radio: {
      queue: "/radio/queue",
      addToQueue: "/radio/queue",
      removeFromQueue: (id: string) => `/radio/queue/${id}`,
      skip: "/radio/skip",
      toggle: "/radio/toggle",
      history: "/radio/history",
    },
    songs: {
      upload: "/songs/upload",
      list: "/songs",
      details: (id: string) => `/songs/${id}`,
      stream: (id: string) => `/songs/stream/${id}`,
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

  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (isJson) {
      const data = await response.json();

      // Add status code to the response
      if (typeof data === "object") {
        data.statusCode = response.status;
      }

      if (!response.ok) {
        // For 409 Conflict, return the response as is
        if (response.status === 409) {
          return data as T;
        }
        // For other errors, throw them
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      }

      return data as T;
    }

    // For non-JSON responses, check if the response is ok
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // For non-JSON responses (like audio streams), return the response itself
    return response as unknown as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const token = this.getAuthToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(!isFormData && apiConfig.headers),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Handle FormData uploads with progress
    if (
      onProgress &&
      isFormData &&
      (options.method === "POST" || options.method === "PUT")
    ) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || "POST", `${apiConfig.baseUrl}${endpoint}`);

        Object.entries(headers).forEach(([key, value]) => {
          if (value) xhr.setRequestHeader(key, value as string);
        });

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round(
              (event.loaded * 100) / event.total
            );
            onProgress(percentCompleted);
          }
        };

        xhr.onload = async () => {
          try {
            const response = new Response(xhr.response, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers({
                "Content-Type":
                  xhr.getResponseHeader("Content-Type") || "application/json",
              }),
            });
            const data = await this.handleResponse<T>(response);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(options.body as FormData);
      });
    }

    try {
      const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Include credentials for CORS
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  async getAudioStream(songId: string): Promise<Response> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${apiConfig.baseUrl}${apiConfig.endpoints.songs.stream(songId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch audio stream");
    }

    return response;
  }

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

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
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

// Export a singleton instance
export const apiClient = ApiClient.getInstance();
