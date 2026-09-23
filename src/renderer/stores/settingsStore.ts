import { create } from "zustand";
import type {
  UserSettings,
  ThemeName,
  VisualizerMode,
  RepeatMode,
} from "../../shared/types";
import { AudioEngine } from "../audio/engine";
import { EQ_PRESETS } from "../audio/presets";
import { usePlayerStore } from "./playerStore";
interface SettingsState extends UserSettings {
  isLoaded: boolean;
  notificationsEnabled: boolean;
  initSettings: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setPlaybackRate: (rate: number) => void;
  setTheme: (theme: ThemeName) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setEqualizerPreset: (presetName: string) => void;
  setEqualizerBand: (index: number, value: number) => void;
  toggleEqualizer: (enabled: boolean) => void;
  setEqualizerPreamp: (preamp: number) => void;
  saveFolders: (folders: string[]) => void;
  toggleNotifications: (enabled: boolean) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  folders: [],
  notificationsEnabled: true,
  volume: 0.8,
  isMuted: false,
  repeatMode: "off",
  shuffle: false,
  playbackRate: 1,
  theme: "dark",
  visualizerMode: "spectrum",
  equalizer: {
    enabled: true,
    preset: "Flat",
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0,
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  initSettings: async () => {
    if (get().isLoaded) return;
    try {
      const saved = await window.electronAPI.getSettings();
      const merged = { ...DEFAULT_SETTINGS, ...saved };
      set({ ...merged, isLoaded: true });

      // Apply initial values to audio engine
      const engine = AudioEngine.getInstance();
      engine.setVolume(merged.isMuted ? 0 : merged.volume);
      engine.setMuted(merged.isMuted);
      engine.setPlaybackRate(merged.playbackRate);
      engine.setBands(merged.equalizer.bands, merged.equalizer.enabled);
      engine.setPreamp(merged.equalizer.preamp);
    } catch (err) {
      console.error("Failed to init settings:", err);
      set({ isLoaded: true });
    }
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: false });
    const engine = AudioEngine.getInstance();
    engine.setVolume(clamped);
    engine.setMuted(false);
    window.electronAPI.saveSettings({ volume: clamped, isMuted: false });
  },

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });
    const engine = AudioEngine.getInstance();
    engine.setMuted(nextMuted);
    window.electronAPI.saveSettings({ isMuted: nextMuted });
  },

  setRepeatMode: (repeatMode: RepeatMode) => {
    set({ repeatMode });
    window.electronAPI.saveSettings({ repeatMode });
  },

  toggleShuffle: () => {
    const nextShuffle = !get().shuffle;

    set({
      shuffle: nextShuffle,
    });

    usePlayerStore.getState().toggleShuffleQueue(nextShuffle);

    window.electronAPI.saveSettings({
      shuffle: nextShuffle,
    });
  },
  setPlaybackRate: (playbackRate: number) => {
    set({ playbackRate });
    AudioEngine.getInstance().setPlaybackRate(playbackRate);
    window.electronAPI.saveSettings({ playbackRate });
  },

  setTheme: (theme: ThemeName) => {
    set({ theme });
    window.electronAPI.saveSettings({ theme });
  },

  setVisualizerMode: (visualizerMode: VisualizerMode) => {
    set({ visualizerMode });
    window.electronAPI.saveSettings({ visualizerMode });
  },
  toggleNotifications: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    window.electronAPI.saveSettings({
      notificationsEnabled: enabled,
    });
  },
  setEqualizerPreset: (presetName: string) => {
    const preset = EQ_PRESETS[presetName];
    if (!preset) return;
    const newEq = {
      ...get().equalizer,
      preset: presetName,
      bands: [...preset.gains],
    };
    set({ equalizer: newEq });
    const engine = AudioEngine.getInstance();
    engine.setBands(newEq.bands, newEq.enabled);
    window.electronAPI.saveSettings({ equalizer: newEq });
  },

  setEqualizerBand: (index: number, value: number) => {
    const currentBands = [...get().equalizer.bands];
    currentBands[index] = Math.max(-12, Math.min(12, value));
    const newEq = {
      ...get().equalizer,
      preset: "Custom",
      bands: currentBands,
    };
    set({ equalizer: newEq });
    const engine = AudioEngine.getInstance();
    engine.setBands(currentBands, newEq.enabled);
    window.electronAPI.saveSettings({ equalizer: newEq });
  },

  toggleEqualizer: (enabled: boolean) => {
    const newEq = { ...get().equalizer, enabled };
    set({ equalizer: newEq });
    const engine = AudioEngine.getInstance();
    engine.setBands(newEq.bands, enabled);
    window.electronAPI.saveSettings({ equalizer: newEq });
  },

  setEqualizerPreamp: (preamp: number) => {
    const clamped = Math.max(-12, Math.min(12, preamp));
    const newEq = { ...get().equalizer, preamp: clamped };
    set({ equalizer: newEq });
    AudioEngine.getInstance().setPreamp(clamped);
    window.electronAPI.saveSettings({ equalizer: newEq });
  },

  saveFolders: (folders: string[]) => {
    set({ folders });
    window.electronAPI.saveSettings({ folders });
  },
}));
