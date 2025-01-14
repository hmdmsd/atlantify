// services/radio.service.ts
import { ApiClient } from "../config/api.config";
import { EventEmitter } from "events";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  addedBy: {
    id: string;
    username: string;
  };
  addedAt: string;
}

interface QueueState {
  currentTrack: Track | null;
  queue: Track[];
  listeners: number;
}

interface QueueUpdateEvent {
  type: "QUEUE_UPDATE" | "TRACK_CHANGE" | "LISTENERS_UPDATE";
  data: Partial<QueueState>;
}

class RadioService extends EventEmitter {
  private static instance: RadioService;
  private api: ApiClient;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private queueState: QueueState = {
    currentTrack: null,
    queue: [],
    listeners: 0,
  };

  private constructor() {
    super();
    this.api = ApiClient.getInstance();
    this.setupWebSocket();
  }

  public static getInstance(): RadioService {
    if (!RadioService.instance) {
      RadioService.instance = new RadioService();
    }
    return RadioService.instance;
  }

  private setupWebSocket(): void {
    const wsUrl = process.env.VITE_WS_URL || "ws://localhost:3000";
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const message: QueueUpdateEvent = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    this.ws.onclose = () => {
      this.handleWebSocketClose();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.ws?.close();
    };
  }

  private handleWebSocketMessage(message: QueueUpdateEvent): void {
    switch (message.type) {
      case "QUEUE_UPDATE":
        if (message.data.queue) {
          this.queueState.queue = message.data.queue;
          this.emit("queueUpdate", this.queueState.queue);
        }
        break;

      case "TRACK_CHANGE":
        if (message.data.currentTrack !== undefined) {
          this.queueState.currentTrack = message.data.currentTrack;
          this.emit("trackChange", this.queueState.currentTrack);
        }
        break;

      case "LISTENERS_UPDATE":
        if (message.data.listeners !== undefined) {
          this.queueState.listeners = message.data.listeners;
          this.emit("listenersUpdate", this.queueState.listeners);
        }
        break;
    }
  }

  private handleWebSocketClose(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.setupWebSocket();
        this.reconnectTimeout *= 2; // Exponential backoff
      }, this.reconnectTimeout);
    } else {
      this.emit("connectionError", "Failed to connect to radio server");
    }
  }

  public async getCurrentQueue(): Promise<QueueState> {
    try {
      const response = await this.api.get<QueueState>("/radio/queue");
      this.queueState = response;
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async addToQueue(trackId: string): Promise<void> {
    try {
      await this.api.post("/radio/queue", { trackId });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async removeFromQueue(trackId: string): Promise<void> {
    try {
      await this.api.delete(`/radio/queue/${trackId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async skipTrack(): Promise<void> {
    try {
      await this.api.post("/radio/skip");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async voteToSkip(): Promise<void> {
    try {
      await this.api.post("/radio/vote-skip");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getHistory(page = 1, limit = 10): Promise<Track[]> {
    try {
      const response = await this.api.get<Track[]>(
        `/radio/history?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public getCurrentTrack(): Track | null {
    return this.queueState.currentTrack;
  }

  public getQueue(): Track[] {
    return this.queueState.queue;
  }

  public getListenerCount(): number {
    return this.queueState.listeners;
  }

  public disconnect(): void {
    this.ws?.close();
    this.removeAllListeners();
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "string") {
      return new Error(error);
    }

    return new Error("An unknown error occurred in radio service");
  }

  // Event listener methods
  public onQueueUpdate(callback: (queue: Track[]) => void): void {
    this.on("queueUpdate", callback);
  }

  public onTrackChange(callback: (track: Track | null) => void): void {
    this.on("trackChange", callback);
  }

  public onListenersUpdate(callback: (count: number) => void): void {
    this.on("listenersUpdate", callback);
  }

  public onConnectionError(callback: (error: string) => void): void {
    this.on("connectionError", callback);
  }

  public offQueueUpdate(callback: (queue: Track[]) => void): void {
    this.off("queueUpdate", callback);
  }

  public offTrackChange(callback: (track: Track | null) => void): void {
    this.off("trackChange", callback);
  }

  public offListenersUpdate(callback: (count: number) => void): void {
    this.off("listenersUpdate", callback);
  }

  public offConnectionError(callback: (error: string) => void): void {
    this.off("connectionError", callback);
  }
}

export const radioService = RadioService.getInstance();
