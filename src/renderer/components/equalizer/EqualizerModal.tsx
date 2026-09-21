import React from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../../audio/presets';

export const EqualizerModal: React.FC = () => {
  const { isEqualizerOpen, toggleEqualizer } = useUIStore();
  const {
    equalizer,
    setEqualizerBand,
    setEqualizerPreset,
    toggleEqualizer: setEnabled,
    setEqualizerPreamp,
  } = useSettingsStore();

  if (!isEqualizerOpen) return null;

  const handleReset = () => {
    setEqualizerPreset('Flat');
    setEqualizerPreamp(0);
  };

  const formatFreq = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-[680px] rounded-2xl glass-panel p-6 shadow-2xl border border-white/10 text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Equalizer</h2>
              <p className="text-xs text-slate-400">10-band parametric audio filter</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Enable toggle */}
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <span className="text-slate-400">EQ Active</span>
              <input
                type="checkbox"
                checked={equalizer.enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-white/10"
              />
            </label>

            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition"
              title="Reset to Flat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleEqualizer(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 mr-1">Presets:</span>
          {Object.keys(EQ_PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => setEqualizerPreset(name)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                equalizer.preset === name
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {name}
            </button>
          ))}
          {equalizer.preset === 'Custom' && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Custom
            </span>
          )}
        </div>

        {/* Sliders Container */}
        <div className="flex items-end justify-between px-3 py-6 rounded-xl bg-slate-950/40 border border-white/5">
          {/* Preamp */}
          <div className="flex flex-col items-center gap-3 pr-4 border-r border-white/10">
            <span className="text-[11px] font-mono text-slate-400">
              {equalizer.preamp > 0 ? `+${equalizer.preamp.toFixed(1)}` : equalizer.preamp.toFixed(1)} dB
            </span>
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={equalizer.preamp}
              onChange={(e) => setEqualizerPreamp(parseFloat(e.target.value))}
              disabled={!equalizer.enabled}
              className="vertical-slider"
            />
            <span className="text-xs font-semibold text-indigo-400 mt-2">Preamp</span>
          </div>

          {/* 10 Bands */}
          <div className="flex-1 flex items-end justify-around pl-2">
            {EQ_FREQUENCIES.map((freq, index) => {
              const gain = equalizer.bands[index] || 0;
              return (
                <div key={freq} className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                  </span>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={gain}
                    onChange={(e) => setEqualizerBand(index, parseFloat(e.target.value))}
                    disabled={!equalizer.enabled}
                    className="vertical-slider"
                  />
                  <span className="text-[11px] font-medium text-slate-400 mt-2">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Range: -12 dB to +12 dB</span>
          <span>Changes are applied in real-time</span>
        </div>
      </div>
    </div>
  );
};
