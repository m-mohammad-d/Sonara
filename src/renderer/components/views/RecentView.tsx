import React from 'react';
import { Play, Heart, Music2, Clock, History, Shuffle, MoreHorizontal } from 'lucide-react';
import type { Track } from '../../../shared/types';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ExportMenu } from '../export/ExportMenu';

export const RecentView: React.FC = () => {
  const { recentlyPlayed, isFavorite, toggleFavorite } = usePlaylistStore();
  const { tracks } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { openContextMenu } = useUIStore();

  const recentTracks = (recentlyPlayed || []).map((id: string) => tracks[id]).filter(Boolean) as Track[];

  const handlePlay = (shuffle = false) => {
    if (recentTracks.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * recentTracks.length);
      playTrack(recentTracks[randIdx], recentTracks);
    } else {
      playTrack(recentTracks[0], recentTracks);
    }
  };

  if (recentTracks.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Listening History"
        description="Tracks you play will automatically appear here so you can easily jump back in."
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent-subtle text-accent-text">
              <History className="w-6 h-6" />
            </span>
            <span>Recently Played</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-2">
            {recentTracks.length} {recentTracks.length === 1 ? 'track' : 'tracks'} in history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlay(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-sm shadow-accent-shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play All</span>
          </button>

          <button
            onClick={() => handlePlay(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated text-foreground-secondary border border-border-subtle transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-accent-text" />
            <span>Shuffle</span>
          </button>

          <ExportMenu
            collectionName="Recently Played"
            source="recently-played"
            tracks={recentTracks}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-[36px_1fr_1fr_1fr_60px_64px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground-subtle border-b border-border-subtle sticky top-0 bg-app/95 backdrop-blur z-10">
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
          {recentTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const favorited = isFavorite(track.id);

            return (
              <div
                key={`${track.id}_${idx}`}
                onDoubleClick={() => playTrack(track, recentTracks)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu({ x: e.clientX, y: e.clientY, track });
                }}
                className={`group grid grid-cols-[36px_1fr_1fr_1fr_60px_64px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  isCurrent
                    ? 'bg-accent-subtle text-accent-text border border-accent-border font-medium'
                    : 'text-foreground-secondary hover:bg-surface-hover border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <span className={`text-[11px] font-mono group-hover:hidden ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground-subtle'}`}>
                    {isCurrent && isPlaying ? '▶' : idx + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track, recentTracks)}
                    className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-accent-text hover:text-accent transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-surface-input shrink-0 flex items-center justify-center border border-border-subtle">
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt={track.album} className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="w-3.5 h-3.5 text-foreground-subtle" />
                    )}
                  </div>
                  <span className={`font-semibold truncate ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground'}`}>
                    {track.title}
                  </span>
                </div>

                <span className="truncate text-foreground-muted pr-3">{track.artist}</span>
                <span className="truncate text-foreground-subtle pr-3">{track.album}</span>
                <span className="text-right font-mono text-foreground-muted">{formatTime(track.duration)}</span>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="p-1 text-foreground-subtle hover:text-red-400 transition"
                    title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        favorited ? 'text-red-400 fill-red-400' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      openContextMenu({
                        x: rect.left,
                        y: rect.bottom + 4,
                        track,
                      });
                    }}
                    className="p-1 text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100 transition rounded hover:bg-surface-hover"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
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
