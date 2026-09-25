import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  ListMusic,
  Heart,
  Music2,
  Activity,
  Moon,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useUIStore } from '../../stores/uiStore';
import { useSleepTimerStore } from '../../stores/sleepTimerStore';
import { SleepTimerPopover } from '../player/SleepTimerPopover';
import { Slider } from '../common/Slider';
import { formatTime } from '../../utils/formatters';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setSeeking,
    queue,
  } = usePlayerStore();

  const {
    volume,
    setVolume,
    isMuted,
    toggleMute,
    repeatMode,
    setRepeatMode,
    shuffle,
    toggleShuffle,
    equalizer,
    playbackRate,
    setPlaybackRate,
    visualizerMode,
    setVisualizerMode,
  } = useSettingsStore();

  const { toggleFavorite, isFavorite } = usePlaylistStore();
  const { isQueueOpen, toggleQueue, toggleEqualizer, navigate } = useUIStore();
  const { mode: sleepTimerMode, remainingSeconds: sleepTimerRemaining } = useSleepTimerStore();

  const [showVisualizerMenu, setShowVisualizerMenu] = useState(false);
  const [showSleepTimerMenu, setShowSleepTimerMenu] = useState(false);
  const sleepTimerBtnRef = useRef<HTMLButtonElement>(null);

  const isSleepTimerActive = sleepTimerMode !== 'off';

  const favorited = currentTrack ? isFavorite(currentTrack.id) : false;

  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  return (
    <footer className="h-20 w-full bg-panel border-t border-border-subtle px-4 flex items-center justify-between select-none z-40 relative">
      {/* Left: Track Information */}
      <div className="flex items-center gap-3 w-1/4 min-w-[220px]">
        {currentTrack ? (
          <>
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-elevated shrink-0 border border-border group shadow-md">
              {currentTrack.artworkUrl ? (
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.album}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-accent-text/60" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </p>
              <p
                onClick={() =>
                  navigate('artist-detail', {
                    selectedArtistId: currentTrack.artist.toLowerCase(),
                  })
                }
                className="text-[11px] text-foreground-muted truncate hover:text-accent-text cursor-pointer transition"
              >
                {currentTrack.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="p-2 text-foreground-muted hover:text-red-400 transition"
              title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart
                className={`w-4 h-4 ${
                  favorited ? 'text-red-400 fill-red-400' : 'text-foreground-muted'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-foreground-subtle">
            <div className="w-12 h-12 rounded-xl bg-surface-input border border-border-subtle flex items-center justify-center">
              <Music2 className="w-5 h-5 text-foreground-subtle" />
            </div>
            <div className="text-xs">No track selected</div>
          </div>
        )}
      </div>

      {/* Center: Controls & Seek Bar */}
      <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5 px-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition ${
              shuffle ? 'text-accent-text hover:text-accent' : 'text-foreground-subtle hover:text-foreground'
            }`}
            title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1.5 text-foreground-secondary hover:text-foreground transition active:scale-95"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-accent hover:bg-accent-hover text-accent-fg flex items-center justify-center transition shadow-lg shadow-accent-shadow active:scale-90"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 text-foreground-secondary hover:text-foreground transition active:scale-95"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded-lg transition ${
              repeatMode !== 'off'
                ? 'text-accent-text hover:text-accent'
                : 'text-foreground-subtle hover:text-foreground'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-foreground-muted w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <Slider
            value={currentTime}
            max={duration || 1}
            onChange={(val) => seek(val)}
            onScrubStart={() => setSeeking(true)}
            onScrubEnd={() => setSeeking(false)}
            showTimeTooltip={true}
            className="flex-1"
          />

          <span className="text-[11px] font-mono text-foreground-muted w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Audio Features & Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
        {/* Playback speed indicator */}
        <button
          onClick={cyclePlaybackRate}
          className="text-[11px] font-mono text-foreground-muted hover:text-foreground px-2 py-1 rounded bg-surface-hover border border-border-subtle transition"
          title="Playback Speed"
        >
          {playbackRate}x
        </button>

        {/* Visualizer Mode Selector */}
        <div className="relative">
          <button
            onClick={() => setShowVisualizerMenu(!showVisualizerMenu)}
            className={`p-1.5 rounded-lg transition ${
              visualizerMode ? 'text-accent-text hover:text-accent' : 'text-foreground-muted hover:text-foreground'
            }`}
            title="Visualizer Mode"
          >
            <Activity className="w-4 h-4" />
          </button>

          {showVisualizerMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-32 rounded-xl glass-panel p-1 border border-border shadow-2xl flex flex-col gap-0.5 text-xs">
              {(['spectrum', 'waveform', 'bars', 'circular'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setVisualizerMode(mode);
                    setShowVisualizerMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-left capitalize transition ${
                    visualizerMode === mode
                      ? 'bg-accent text-accent-fg font-medium'
                      : 'text-foreground-secondary hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Equalizer Toggle */}
        <button
          onClick={() => toggleEqualizer(true)}
          className={`relative p-1.5 rounded-lg transition ${
            equalizer.enabled
              ? 'text-accent-text hover:text-accent'
              : 'text-foreground-muted hover:text-foreground'
          }`}
          title="Equalizer"
        >
          <Sliders className="w-4 h-4" />
          {equalizer.enabled && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>

        {/* Sleep Timer Toggle & Popover */}
        <div className="relative">
          <button
            ref={sleepTimerBtnRef}
            onClick={() => setShowSleepTimerMenu(!showSleepTimerMenu)}
            aria-label="Sleep timer"
            aria-expanded={showSleepTimerMenu}
            aria-haspopup="dialog"
            className={`transition flex items-center gap-1.5 text-xs font-mono font-medium rounded-lg ${
              isSleepTimerActive
                ? 'px-2 py-1 bg-accent-subtle text-accent-text border border-accent-border shadow-sm'
                : 'p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover'
            }`}
            title={
              isSleepTimerActive
                ? sleepTimerMode === 'duration'
                  ? `Sleep Timer: ${formatTime(sleepTimerRemaining || 0)} remaining`
                  : 'Sleep Timer: End of current track'
                : 'Sleep Timer: Off'
            }
          >
            <Moon className="w-4 h-4 shrink-0" />
            {isSleepTimerActive && (
              <span className="truncate max-w-[70px]">
                {sleepTimerMode === 'duration'
                  ? formatTime(sleepTimerRemaining || 0)
                  : 'End of track'}
              </span>
            )}
          </button>

          <SleepTimerPopover
            isOpen={showSleepTimerMenu}
            onClose={() => setShowSleepTimerMenu(false)}
            triggerRef={sleepTimerBtnRef}
          />
        </div>

        {/* Queue Drawer Toggle */}
        <button
          onClick={() => toggleQueue()}
          className={`relative p-1.5 rounded-lg transition ${
            isQueueOpen
              ? 'bg-accent-subtle text-accent-text border border-accent-border'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
          }`}
          title="Playback Queue"
        >
          <ListMusic className="w-4 h-4" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-accent text-[9px] font-bold text-accent-fg leading-tight">
              {queue.length}
            </span>
          )}
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 w-28">
          <button
            onClick={toggleMute}
            className="text-foreground-muted hover:text-foreground transition shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <Slider
            value={isMuted ? 0 : volume}
            max={1}
            onChange={(val) => setVolume(val)}
            className="flex-1"
          />
        </div>
      </div>
    </footer>
  );
};
