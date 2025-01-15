// services/audio.service.ts
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

interface AudioAnalytics {
  peaks: number[];
  averageVolume: number;
  frequency: number[];
}

class AudioService extends EventEmitter {
  private static instance: AudioService;
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private currentTrack: AudioTrack | null = null;
  private preloadedTracks: Map<string, HTMLAudioElement> = new Map();
  private playbackRate: number = 1.0;

  private constructor() {
    super();
    this.audio = new Audio();
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

    // Handle audio errors
    this.audio.addEventListener("error", () => {
      const error = this.audio.error;
      this.emit("error", {
        code: error?.code,
        message: this.getAudioErrorMessage(error?.code),
      });
    });
  }

  private initializeAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaElementSource(this.audio);

      // Create and connect analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      // Create and connect gain node
      this.gainNode = this.audioContext.createGain();

      // Connect nodes: source -> analyser -> gain -> destination
      source
        .connect(this.analyser)
        .connect(this.gainNode)
        .connect(this.audioContext.destination);
    }
  }

  public async loadTrack(track: AudioTrack): Promise<void> {
    try {
      this.currentTrack = track;
      this.audio.src = track.url;
      await this.audio.load();
      this.emit("trackLoaded", track);
    } catch (error) {
      this.emit("error", {
        code: "LOAD_ERROR",
        message: "Failed to load track",
      });
      throw error;
    }
  }

  public async play(track?: AudioTrack): Promise<void> {
    try {
      if (track && track.id !== this.currentTrack?.id) {
        await this.loadTrack(track);
      }

      if (this.audioContext?.state === "suspended") {
        await this.audioContext.resume();
      }

      await this.audio.play();
    } catch (error) {
      this.emit("error", {
        code: "PLAYBACK_ERROR",
        message: "Failed to play track",
      });
      throw error;
    }
  }

  public pause(): void {
    this.audio.pause();
  }

  public stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  public seek(time: number): void {
    if (time >= 0 && time <= this.audio.duration) {
      this.audio.currentTime = time;
    }
  }

  public setVolume(value: number): void {
    this.audio.volume = Math.max(0, Math.min(1, value));
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.5, Math.min(2, rate));
    this.audio.playbackRate = this.playbackRate;
  }

  public toggleMute(): void {
    this.audio.muted = !this.audio.muted;
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

  public getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  public async preloadTrack(track: AudioTrack): Promise<void> {
    if (!this.preloadedTracks.has(track.id)) {
      const audio = new Audio();
      audio.src = track.url;
      audio.preload = "auto";
      this.preloadedTracks.set(track.id, audio);

      return new Promise((resolve, reject) => {
        audio.addEventListener("canplaythrough", () => resolve());
        audio.addEventListener("error", (error) => reject(error));
        audio.load();
      });
    }
  }

  public clearPreloadedTracks(): void {
    this.preloadedTracks.forEach((audio) => {
      audio.src = "";
      audio.load();
    });
    this.preloadedTracks.clear();
  }

  public getAudioAnalytics(): AudioAnalytics | null {
    if (!this.analyser) {
      this.initializeAudioContext();
      if (!this.analyser) return null;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const peaks = Array.from(dataArray);
    const averageVolume =
      peaks.reduce((acc, val) => acc + val, 0) / peaks.length;

    return {
      peaks,
      averageVolume,
      frequency: Array.from(dataArray),
    };
  }

  public async fadeVolume(
    targetVolume: number,
    duration: number
  ): Promise<void> {
    if (!this.gainNode) return;

    const startVolume = this.gainNode.gain.value;
    const startTime = this.audioContext!.currentTime;

    this.gainNode.gain.cancelScheduledValues(startTime);
    this.gainNode.gain.setValueAtTime(startVolume, startTime);
    this.gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      startTime + duration
    );
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

  // Event handler registration methods
  public onPlay(callback: (state: AudioState) => void): void {
    this.on("play", callback);
  }

  public onPause(callback: (state: AudioState) => void): void {
    this.on("pause", callback);
  }

  public onEnded(callback: (state: AudioState) => void): void {
    this.on("ended", callback);
  }

  public onTimeUpdate(callback: (state: AudioState) => void): void {
    this.on("timeupdate", callback);
  }

  public onError(
    callback: (error: { code: string | number | null; message: string }) => void
  ): void {
    this.on("error", callback);
  }

  public onTrackLoaded(callback: (track: AudioTrack) => void): void {
    this.on("trackLoaded", callback);
  }

  // Cleanup method
  public destroy(): void {
    this.stop();
    this.clearPreloadedTracks();
    this.removeAllListeners();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioService = AudioService.getInstance();
