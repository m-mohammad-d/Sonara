import { EQ_FREQUENCIES } from './presets';

export type AudioEngineListener = {
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onStateChange?: (isPlaying: boolean) => void;
};

export class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private preampNode: GainNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private listeners: AudioEngineListener = {};
  private isInitialized = false;

  private constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';

    this.setupAudioListeners();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public setListener(listener: AudioEngineListener): void {
    this.listeners = listener;
  }

  private initAudioNodes(): void {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

      // Preamp
      this.preampNode = this.audioCtx.createGain();
      this.preampNode.gain.value = 1;

      // 10-Band Biquad Filters
      this.filters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.8;

      // Analyser for visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;

      // Connect graph:
      // source -> preamp -> filter[0] -> ... -> filter[9] -> masterGain -> analyser -> destination
      let previousNode: AudioNode = this.sourceNode;
      previousNode.connect(this.preampNode);
      previousNode = this.preampNode;

      for (const filter of this.filters) {
        previousNode.connect(filter);
        previousNode = filter;
      }

      previousNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize Web Audio graph:', err);
    }
  }

  private setupAudioListeners(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.listeners.onTimeUpdate?.(this.audio.currentTime, this.audio.duration || 0);
    });

    this.audio.addEventListener('ended', () => {
      this.listeners.onEnded?.();
    });

    this.audio.addEventListener('playing', () => {
      this.listeners.onStateChange?.(true);
    });

    this.audio.addEventListener('pause', () => {
      this.listeners.onStateChange?.(false);
    });

    this.audio.addEventListener('error', () => {
      const err = this.audio.error;
      let msg = 'Failed to load or play audio file';
      if (err) {
        switch (err.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            msg = 'Audio playback aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            msg = 'Audio network error';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            msg = 'Audio decoding failed (unsupported or corrupted format)';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            msg = 'Audio format not supported or file missing';
            break;
        }
      }
      this.listeners.onError?.(msg);
      this.listeners.onStateChange?.(false);
    });
  }

  public async play(filePath?: string, startTime = 0): Promise<void> {
    this.initAudioNodes();

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (filePath) {
      // Encode file path for custom scheme
      const normalizedPath = filePath.replace(/\\/g, '/');
      const url = `sonora-media://audio/${encodeURIComponent(normalizedPath).replace(/%2F/g, '/')}`;
      this.audio.src = url;
      this.audio.currentTime = startTime;
    }

    try {
      await this.audio.play();
    } catch (err) {
      this.listeners.onError?.((err as Error).message);
    }
  }

  public pause(): void {
    this.audio.pause();
  }

  public stop(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.listeners.onStateChange?.(false);
  }

  public seek(seconds: number): void {
    if (!isNaN(seconds) && isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    }
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  public setPlaybackRate(rate: number): void {
    this.audio.playbackRate = Math.max(0.5, Math.min(2.5, rate));
  }

  public setPreamp(gainDb: number): void {
    if (this.preampNode && this.audioCtx) {
      // Preamp dB to linear gain
      const linear = Math.pow(10, gainDb / 20);
      this.preampNode.gain.setValueAtTime(linear, this.audioCtx.currentTime);
    }
  }

  public setBands(bands: number[], enabled: boolean): void {
    if (!this.audioCtx) return;
    this.filters.forEach((filter, index) => {
      const gain = enabled ? (bands[index] ?? 0) : 0;
      filter.gain.setValueAtTime(gain, this.audioCtx!.currentTime);
    });
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      array.fill(0);
    }
  }

  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      array.fill(128);
    }
  }

  public getAnalyserFrequencyBinCount(): number {
    return this.analyser?.frequencyBinCount || 128;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime;
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public isAudioPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended && this.audio.readyState > 2;
  }
}
