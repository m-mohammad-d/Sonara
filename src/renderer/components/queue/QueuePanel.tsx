import React from 'react';
import { X, Trash2, Music2, ChevronUp, ChevronDown, Play } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';
import { ExportMenu } from '../export/ExportMenu';

export const QueuePanel: React.FC = () => {
  const { isQueueOpen, toggleQueue } = useUIStore();
  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = usePlayerStore();

  if (!isQueueOpen) return null;

  const upcoming = queue.slice(queueIndex + 1);

  return (
    <aside className="w-80 h-full glass-panel border-l border-border flex flex-col z-40 bg-panel/95 backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-accent-text" />
          <h2 className="font-bold text-sm tracking-tight text-foreground">Playback Queue</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-foreground-secondary">
            {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <ExportMenu
              collectionName="Playback Queue"
              source="queue"
              tracks={queue}
              iconOnly
            />
          )}
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 text-foreground-muted hover:text-red-400 hover:bg-surface-hover rounded-lg transition"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toggleQueue(false)}
            className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Now Playing section */}
        {currentTrack && (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-text mb-2 block">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-accent-subtle border border-accent-border">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-elevated shrink-0 flex items-center justify-center border border-border">
                {currentTrack.artworkUrl ? (
                  <img
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.album}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music2 className="w-5 h-5 text-accent-text/60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{currentTrack.title}</p>
                <p className="text-[11px] text-foreground-muted truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-[11px] font-mono text-accent-text font-medium">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>
          </div>
        )}

        {/* Up Next section */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted mb-2 block">
            Up Next ({upcoming.length})
          </span>

          {upcoming.length === 0 ? (
            <div className="py-8 text-center text-xs text-foreground-subtle">
              Queue is empty. Add songs to keep playing.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcoming.map((track, relativeIndex) => {
                const actualIndex = queueIndex + 1 + relativeIndex;
                return (
                  <div
                    key={`${track.id}_${actualIndex}`}
                    className="group flex items-center gap-2 p-2 rounded-xl hover:bg-surface-hover transition border border-transparent hover:border-border-subtle"
                  >
                    <button
                      onClick={() => playTrack(track)}
                      className="w-7 h-7 rounded-lg bg-surface-input group-hover:bg-accent flex items-center justify-center text-foreground-muted group-hover:text-accent-fg transition shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-foreground-secondary group-hover:text-foreground">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-foreground-muted truncate">{track.artist}</p>
                    </div>

                    <span className="text-[11px] font-mono text-foreground-subtle group-hover:hidden">
                      {formatTime(track.duration)}
                    </span>

                    {/* Action buttons on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      {relativeIndex > 0 && (
                        <button
                          onClick={() => reorderQueue(actualIndex, actualIndex - 1)}
                          className="p-1 text-foreground-muted hover:text-foreground transition"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {relativeIndex < upcoming.length - 1 && (
                        <button
                          onClick={() => reorderQueue(actualIndex, actualIndex + 1)}
                          className="p-1 text-foreground-muted hover:text-foreground transition"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromQueue(actualIndex)}
                        className="p-1 text-foreground-muted hover:text-red-400 transition"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
