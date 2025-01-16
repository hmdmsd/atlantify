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
      toggleVote: (id: string) => `/musicbox/suggestions/${id}/toggle-vote`, // Add this line
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

  private getAuthToken(): string | null {
    const token = localStorage.getItem("auth_token");
    console.log("Current auth token:", token); // Debug log
    return token;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      const error = isJson
        ? await response.json()
        : { message: response.statusText };
      console.error("API Error:", error); // Debug log
      throw new Error(
        error.message || `Request failed with status ${response.status}`
      );
    }

    if (isJson) {
      return response.json();
    }

    throw new Error(`Unexpected content type: ${contentType}`);
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

    console.log("Request details:", {
      url: `${apiConfig.baseUrl}${endpoint}`,
      method: options.method || "GET",
      headers,
    }); // Debug log

    // Handle FormData uploads with progress
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

    // Standard fetch for non-FormData requests
    try {
      const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("Request failed:", error); // Debug log
      throw error;
    }
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

// Export a singleton instance
export const apiClient = ApiClient.getInstance();
