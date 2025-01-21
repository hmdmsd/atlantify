import { EventEmitter } from "events";

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

interface AudioState {
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
}

class AudioService extends EventEmitter {
  private static instance: AudioService;
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private currentTrack: AudioTrack | null = null;
  private gainNode: GainNode | null = null;

  private constructor() {
    super();
    this.audio = new Audio();
    // Set audio element attributes
    this.audio.preload = "auto";
    this.setupAudioListeners();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private setupAudioListeners(): void {
    const events = [
      "play",
      "pause",
      "ended",
      "timeupdate",
      "volumechange",
      "loadstart",
      "loadeddata",
      "canplay",
      "waiting",
      "error",
    ];

    events.forEach((event) => {
      this.audio.addEventListener(event, () => {
        this.emit(event, this.getState());
      });
    });

    this.audio.addEventListener("error", () => {
      const error: any = this.audio.error;
      this.emit("error", {
        code: error?.code,
        message: this.getAudioErrorMessage(error?.code),
      });
    });
  }

  public async loadTrack(track: AudioTrack): Promise<void> {
    try {
      this.currentTrack = track;

      // Clean up previous audio source if exists
      if (this.audio.src) {
        this.audio.src = "";
        this.audio.load();
      }

      // Set new audio source
      this.audio.src = track.url;
      await this.audio.load();

      this.emit("trackLoaded", track);
    } catch (error) {
      console.error("Error loading track:", error);
      this.emit("error", {
        code: "LOAD_ERROR",
        message: "Failed to load track",
        error,
      });
      throw error;
    }
  }

  public async play(): Promise<void> {
    try {
      if (this.audioContext?.state === "suspended") {
        await this.audioContext.resume();
      }

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      this.emit("error", {
        code: "PLAYBACK_ERROR",
        message: "Failed to play track",
      });
      throw error;
    }
  }

  public pause(): void {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  public seek(time: number): void {
    if (time >= 0 && time <= this.audio.duration) {
      this.audio.currentTime = time;
    }
  }

  public setVolume(value: number): void {
    this.audio.volume = Math.max(0, Math.min(1, value));
  }

  public getState(): AudioState {
    return {
      currentTime: this.audio.currentTime,
      duration: this.audio.duration,
      volume: this.audio.volume,
      isMuted: this.audio.muted,
      isPlaying: !this.audio.paused,
      isBuffering: this.audio.readyState < this.audio.HAVE_FUTURE_DATA,
    };
  }

  private getAudioErrorMessage(code: number | null): string {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return "Playback aborted by user";
      case MediaError.MEDIA_ERR_NETWORK:
        return "Network error while loading audio";
      case MediaError.MEDIA_ERR_DECODE:
        return "Audio decoding error";
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "Audio format not supported";
      default:
        return "Unknown audio error";
    }
  }

  public destroy(): void {
    this.pause();
    this.removeAllListeners();
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.audio.src) {
      this.audio.src = "";
      this.audio.load();
    }
  }
}

export const audioService = AudioService.getInstance();
