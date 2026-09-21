import React from 'react';
import { X, Trash2, Music2, ChevronUp, ChevronDown, Play } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';

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
    <aside className="w-80 h-full glass-panel border-l border-white/10 flex flex-col z-40 bg-[#0d101a]/95 backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-sm tracking-tight">Playback Queue</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
            {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toggleQueue(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Now Playing section */}
        {currentTrack && (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                {currentTrack.artworkUrl ? (
                  <img
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.album}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music2 className="w-5 h-5 text-indigo-400/60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-white">{currentTrack.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-[11px] font-mono text-indigo-300">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>
          </div>
        )}

        {/* Up Next section */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Up Next ({upcoming.length})
          </span>

          {upcoming.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Queue is empty. Add songs to keep playing.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcoming.map((track, relativeIndex) => {
                const actualIndex = queueIndex + 1 + relativeIndex;
                return (
                  <div
                    key={`${track.id}_${actualIndex}`}
                    className="group flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5"
                  >
                    <button
                      onClick={() => playTrack(track)}
                      className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-slate-200 group-hover:text-white">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 group-hover:hidden">
                      {formatTime(track.duration)}
                    </span>

                    {/* Action buttons on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      {relativeIndex > 0 && (
                        <button
                          onClick={() => reorderQueue(actualIndex, actualIndex - 1)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {relativeIndex < upcoming.length - 1 && (
                        <button
                          onClick={() => reorderQueue(actualIndex, actualIndex + 1)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromQueue(actualIndex)}
                        className="p-1 text-slate-400 hover:text-red-400 transition"
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
