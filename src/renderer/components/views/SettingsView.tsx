import React from 'react';
import {
  Folder,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Activity,
  Keyboard,
  Info,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { EQ_PRESETS } from '../../audio/presets';
import { AudioVisualizer } from '../visualizer/AudioVisualizer';
import type { VisualizerMode } from '../../../shared/types';

export const SettingsView: React.FC = () => {
  const { folders, selectFoldersAndScan, scanFolders, removeFolder, isScanning, scanProgress } = useLibraryStore();
  const {
    equalizer,
    toggleEqualizer: setEqEnabled,
    setEqualizerPreset,
    playbackRate,
    setPlaybackRate,
    visualizerMode,
    setVisualizerMode,
  } = useSettingsStore();

  const { toggleEqualizer: openEqModal } = useUIStore();

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause playback' },
    { key: '←  /  →', desc: 'Seek 5 seconds backward / forward' },
    { key: '↑  /  ↓', desc: 'Increase / decrease volume by 5%' },
    { key: 'M', desc: 'Mute / Unmute volume' },
    { key: 'N', desc: 'Next track in queue' },
    { key: 'P', desc: 'Previous track in queue' },
    { key: 'Esc', desc: 'Dismiss dialogs, context menus, and drawers' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="mb-6 pb-4 border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your local library, audio preferences, and desktop shortcuts
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-8 max-w-4xl pb-8">
        {/* Section 1: Music Folders */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Music Folders</h2>
                <p className="text-xs text-slate-400">
                  Sonora recursively scans and monitors these directories for audio files
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scanFolders()}
                disabled={isScanning || folders.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Rescanning...' : 'Rescan All'}</span>
              </button>

              <button
                onClick={selectFoldersAndScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm shadow-indigo-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Folder</span>
              </button>
            </div>
          </div>

          {/* Folders List */}
          {folders.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-white/5">
              No folders added yet. Click &ldquo;Add Folder&rdquo; to browse your music files.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {folders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs"
                >
                  <span className="font-mono text-slate-300 truncate max-w-xl">{folder}</span>
                  <button
                    onClick={() => removeFolder(folder)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                    title="Remove folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isScanning && scanProgress && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-indigo-300">
                <span>Scanning: {scanProgress.currentFile}</span>
                <span>{scanProgress.current} / {scanProgress.total}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{
                    width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%`,
                  }}
                  className="h-full bg-indigo-500 transition-all duration-150"
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Audio & Equalizer */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Audio & Equalizer</h2>
                <p className="text-xs text-slate-400">
                  Web Audio API signal processing, 10-band EQ, and playback speed
                </p>
              </div>
            </div>

            <button
              onClick={() => openEqModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm shadow-indigo-500/30"
            >
              Open 10-Band EQ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Equalizer State</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equalizer.enabled}
                    onChange={(e) => setEqEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-0 bg-slate-800 border-white/10"
                  />
                  <span className="text-xs text-slate-400">{equalizer.enabled ? 'Enabled' : 'Bypassed'}</span>
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">Active Preset</span>
                <select
                  value={equalizer.preset}
                  onChange={(e) => setEqualizerPreset(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {Object.keys(EQ_PRESETS).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  {equalizer.preset === 'Custom' && <option value="Custom">Custom</option>}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-200">Playback Speed</span>
              <div className="flex items-center gap-2 flex-wrap">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition ${
                      playbackRate === rate
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Audio Visualizer */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Audio Visualizer</h2>
                <p className="text-xs text-slate-400">
                  Real-time frequency & waveform rendering with Web Audio Analyser
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(['spectrum', 'waveform', 'bars', 'circular'] as VisualizerMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisualizerMode(mode)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition ${
                    visualizerMode === mode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-950/60 border border-white/5 p-4 flex flex-col items-center justify-center">
            <AudioVisualizer height={70} className="w-full max-w-lg" />
            <span className="text-[10px] text-slate-500 mt-2">
              Live visualization preview (plays when audio is active)
            </span>
          </div>
        </section>

        {/* Section 4: Keyboard Shortcuts */}
        <section className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">
                Global hotkeys configured for seamless desktop playback control
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs"
              >
                <span className="text-slate-400">{s.desc}</span>
                <kbd className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[11px] text-white border border-white/10">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Application Info */}
        <section className="glass-card p-5 rounded-2xl flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Sonora Desktop Music Player v1.0.0</span>
          </div>
          <span>Electron • React • TypeScript • Web Audio API</span>
        </section>
      </div>
    </div>
  );
};
