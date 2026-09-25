import React from "react";
import {
  Folder,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Activity,
  Keyboard,
  Info,
  Bell,
  Palette,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { useLibraryStore } from "../../stores/libraryStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useUIStore } from "../../stores/uiStore";
import { EQ_PRESETS } from "../../audio/presets";
import { AudioVisualizer } from "../visualizer/AudioVisualizer";
import { ACCENT_PRESETS, type AccentColor } from "../../theme/theme";
import type { VisualizerMode } from "../../../shared/types";

export const SettingsView: React.FC = () => {
  const {
    folders,
    selectFoldersAndScan,
    scanFolders,
    removeFolder,
    isScanning,
    scanProgress,
  } = useLibraryStore();

  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    equalizer,
    toggleEqualizer: setEqEnabled,
    setEqualizerPreset,
    playbackRate,
    setPlaybackRate,
    visualizerMode,
    setVisualizerMode,
    notificationsEnabled,
    toggleNotifications,
  } = useSettingsStore();

  const { toggleEqualizer: openEqModal } = useUIStore();

  const shortcuts = [
    { key: "Space", desc: "Play / Pause playback" },
    { key: "←  /  →", desc: "Seek 5 seconds backward / forward" },
    { key: "↑  /  ↓", desc: "Increase / decrease volume by 5%" },
    { key: "M", desc: "Mute / Unmute volume" },
    { key: "N", desc: "Next track in queue" },
    { key: "P", desc: "Previous track in queue" },
    { key: "Esc", desc: "Dismiss dialogs, context menus, and drawers" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden p-6 select-none">
      <div className="mb-6 pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Configure your appearance, local library, audio preferences, and
          desktop shortcuts
        </p>
      </div>

      <div className="flex-1 w-full overflow-y-auto pr-1 flex flex-col gap-8 pb-8">
        {/* Section 1: Appearance */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent-subtle p-2 text-accent-text">
                <Palette className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Appearance
                </h2>
                <p className="text-xs text-foreground-muted">
                  Choose your interface appearance mode and accent palette
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Theme Mode */}
              <div>
                <span className="mb-2.5 block text-xs font-semibold text-foreground-secondary">
                  Theme
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "dark" as const,
                      label: "Dark",
                      description: "Low-light focus",
                      icon: Moon,
                    },
                    {
                      id: "light" as const,
                      label: "Light",
                      description: "Daylight clarity",
                      icon: Sun,
                    },
                  ].map(({ id, label, description, icon: Icon }) => {
                    const isSelected = themeMode === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setThemeMode(id)}
                        aria-pressed={isSelected}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-accent-border bg-accent-subtle shadow-sm"
                            : "border-border-subtle bg-surface-input hover:border-border hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={`rounded-lg p-1.5 ${
                              isSelected
                                ? "bg-accent text-accent-fg"
                                : "bg-surface-hover text-foreground-muted"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">
                              {label}
                            </p>
                            <p className="text-[10px] text-foreground-muted">
                              {description}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-secondary">
                    Accent Color
                  </span>

                  <span className="text-[10px] font-medium text-foreground-muted">
                    {ACCENT_PRESETS[accentColor].label}
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Accent color"
                  className="rounded-xl border border-border-subtle bg-surface-input p-3"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(ACCENT_PRESETS) as AccentColor[]).map(
                      (key) => {
                        const preset = ACCENT_PRESETS[key];
                        const isSelected = accentColor === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${preset.label} accent`}
                            onClick={() => setAccentColor(key)}
                            className={`group flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 transition-all duration-150 ${
                              isSelected
                                ? "border-accent-border bg-accent-subtle"
                                : "border-transparent hover:border-border-subtle hover:bg-surface-hover"
                            }`}
                          >
                            <span
                              className={`h-3 w-3 shrink-0 rounded-full transition-transform duration-150 ${
                                isSelected
                                  ? "scale-110"
                                  : "group-hover:scale-110"
                              }`}
                              style={{ backgroundColor: preset.previewHex }}
                            />

                            <span
                              className={`min-w-0 truncate text-[11px] font-medium ${
                                isSelected
                                  ? "text-foreground"
                                  : "text-foreground-muted group-hover:text-foreground-secondary"
                              }`}
                            >
                              {preset.label}
                            </span>

                            {isSelected && (
                              <Check className="ml-auto h-3 w-3 shrink-0 text-accent-text stroke-[3]" />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 2: Music Folders */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-subtle text-accent-text">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Music Folders
                </h2>
                <p className="text-xs text-foreground-muted">
                  Sonora recursively scans and monitors these directories for
                  audio files
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scanFolders()}
                disabled={isScanning || folders.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated disabled:opacity-40 text-foreground-secondary transition border border-border-subtle"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`}
                />
                <span>{isScanning ? "Rescanning..." : "Rescan All"}</span>
              </button>

              <button
                onClick={selectFoldersAndScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-sm shadow-accent-shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Folder</span>
              </button>
            </div>
          </div>

          {folders.length === 0 ? (
            <div className="p-6 text-center text-xs text-foreground-subtle rounded-xl bg-surface-input border border-border-subtle">
              No folders added yet. Click &ldquo;Add Folder&rdquo; to browse
              your music files.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {folders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-input border border-border-subtle text-xs"
                >
                  <span className="font-mono text-foreground-secondary truncate max-w-xl">
                    {folder}
                  </span>
                  <button
                    onClick={() => removeFolder(folder)}
                    className="p-1.5 text-foreground-subtle hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                    title="Remove folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isScanning && scanProgress && (
            <div className="p-3 rounded-xl bg-accent-subtle border border-accent-border flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-accent-text">
                <span>Scanning: {scanProgress.currentFile}</span>
                <span>
                  {scanProgress.current} / {scanProgress.total}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div
                  style={{
                    width: `${
                      scanProgress.total > 0
                        ? (scanProgress.current / scanProgress.total) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-accent transition-all duration-150"
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Audio & Equalizer */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-subtle text-accent-text">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Audio & Equalizer
                </h2>
                <p className="text-xs text-foreground-muted">
                  Web Audio API signal processing, 10-band EQ, and playback
                  speed
                </p>
              </div>
            </div>

            <button
              onClick={() => openEqModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-sm shadow-accent-shadow"
            >
              Open 10-Band EQ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-input border border-border-subtle flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground-secondary">
                  Equalizer State
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equalizer.enabled}
                    onChange={(e) => setEqEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-0 bg-surface-hover border-border"
                  />
                  <span className="text-xs text-foreground-muted">
                    {equalizer.enabled ? "Enabled" : "Bypassed"}
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-foreground-muted">
                  Active Preset
                </span>
                <select
                  value={equalizer.preset}
                  onChange={(e) => setEqualizerPreset(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface-hover border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {Object.keys(EQ_PRESETS).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  {equalizer.preset === "Custom" && (
                    <option value="Custom">Custom</option>
                  )}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-input border border-border-subtle flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground-secondary">
                Playback Speed
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition ${
                      playbackRate === rate
                        ? "bg-accent text-accent-fg"
                        : "bg-surface-hover text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Audio Visualizer */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-subtle text-accent-text">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Audio Visualizer
                </h2>
                <p className="text-xs text-foreground-muted">
                  Real-time frequency & waveform rendering with Web Audio
                  Analyser
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(
                ["spectrum", "waveform", "bars", "circular"] as VisualizerMode[]
              ).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisualizerMode(mode)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition ${
                    visualizerMode === mode
                      ? "bg-accent text-accent-fg"
                      : "bg-surface-hover text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-surface-input border border-border-subtle p-4 flex flex-col items-center justify-center">
            <AudioVisualizer height={70} className="w-full max-w-lg" />
            <span className="text-[10px] text-foreground-subtle mt-2">
              Live visualization preview (plays when audio is active)
            </span>
          </div>
        </section>

        {/* Section 5: Desktop Notifications */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-subtle text-accent-text">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Desktop Notifications
                </h2>
                <p className="text-xs text-foreground-muted">
                  Show a notification when the current track changes
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => toggleNotifications(!notificationsEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                notificationsEnabled
                  ? "bg-accent"
                  : "bg-surface-hover border border-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Section 6: Keyboard Shortcuts */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-subtle text-accent-text">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-foreground-muted">
                Global hotkeys configured for seamless desktop playback control
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-input border border-border-subtle text-xs"
              >
                <span className="text-foreground-secondary">{s.desc}</span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface-hover font-mono text-[11px] text-foreground border border-border-subtle">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Application Info */}
        <section className="glass-card p-5 rounded-2xl flex items-center justify-between text-xs text-foreground-subtle">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-foreground-muted" />
            <span>Sonora Desktop Music Player v1.0.0</span>
          </div>
          <span>Electron • React • TypeScript • Web Audio API</span>
        </section>
      </div>
    </div>
  );
};
