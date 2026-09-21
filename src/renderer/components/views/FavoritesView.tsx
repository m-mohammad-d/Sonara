import React from 'react';
import { Heart, Play, Shuffle, Clock, Music2 } from 'lucide-react';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';

export const FavoritesView: React.FC = () => {
  const { favorites, toggleFavorite } = usePlaylistStore();
  const { tracks } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { openContextMenu, navigate } = useUIStore();

  const favoriteTracks = favorites
    .map((id) => tracks[id])
    .filter(Boolean);

  const totalDuration = favoriteTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlay = (shuffle = false) => {
    if (favoriteTracks.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * favoriteTracks.length);
      playTrack(favoriteTracks[randIdx], favoriteTracks);
    } else {
      playTrack(favoriteTracks[0], favoriteTracks);
    }
  };

  if (favoriteTracks.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No Favorites Yet"
        description="Click the heart icon on any song you love to save it in your favorites collection."
        actionText="Browse Songs"
        onAction={() => navigate('tracks')}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <Heart className="w-6 h-6 fill-red-400" />
            </span>
            <span>Favorites</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            {favoriteTracks.length} {favoriteTracks.length === 1 ? 'song' : 'songs'} • {formatTime(totalDuration)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlay(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm shadow-indigo-500/30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play All</span>
          </button>

          <button
            onClick={() => handlePlay(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-[36px_1fr_1fr_1fr_60px_40px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 sticky top-0 bg-[#0b0d14]/95 backdrop-blur z-10">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <span className="flex justify-end">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <span />
        </div>

        <div className="flex flex-col py-1">
          {favoriteTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onDoubleClick={() => playTrack(track, favoriteTracks)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu({ x: e.clientX, y: e.clientY, track });
                }}
                className={`group grid grid-cols-[36px_1fr_1fr_1fr_60px_40px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <span className={`text-[11px] font-mono group-hover:hidden ${isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                    {isCurrent && isPlaying ? '▶' : idx + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track, favoriteTracks)}
                    className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-indigo-400 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center border border-white/5">
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt={track.album} className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <span className={`font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                    {track.title}
                  </span>
                </div>

                <span className="truncate text-slate-400 pr-3">{track.artist}</span>
                <span className="truncate text-slate-500 pr-3">{track.album}</span>
                <span className="text-right font-mono text-slate-400">{formatTime(track.duration)}</span>

                <div className="flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="p-1 text-red-400 hover:text-slate-500 transition"
                    title="Remove from favorites"
                  >
                    <Heart className="w-3.5 h-3.5 fill-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
