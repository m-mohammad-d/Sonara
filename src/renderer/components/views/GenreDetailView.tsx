import React from 'react';
import { Play, Shuffle, Radio, Clock, ArrowLeft, Heart, MoreHorizontal } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';
import { ExportMenu } from '../export/ExportMenu';

export const GenreDetailView: React.FC = () => {
  const { selectedGenre, goBack, openContextMenu } = useUIStore();
  const { tracks } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { isFavorite, toggleFavorite } = usePlaylistStore();

  if (!selectedGenre) {
    return (
      <div className="p-8 text-center text-foreground-muted">
        <p>No genre selected.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface-elevated text-xs text-foreground transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const genreTracks = Object.values(tracks)
    .filter((tr) => tr.genre === selectedGenre)
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const totalDuration = genreTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayGenre = (shuffle = false) => {
    if (genreTracks.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * genreTracks.length);
      playTrack(genreTracks[randIdx], genreTracks);
    } else {
      playTrack(genreTracks[0], genreTracks);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="mb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-xs font-medium text-foreground-muted hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Genres</span>
        </button>
      </div>

      <div className="flex items-end gap-6 mb-8 pb-6 border-b border-border-subtle">
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-accent to-accent-hover shrink-0 flex items-center justify-center shadow-xl">
          <Radio className="w-12 h-12 text-accent-fg" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-text">
            Genre
          </span>
          <h1 className="text-3xl font-black text-foreground tracking-tight truncate mt-1">
            {selectedGenre}
          </h1>

          <p className="text-xs text-foreground-muted mt-2">
            {genreTracks.length} {genreTracks.length === 1 ? 'track' : 'tracks'} • {formatTime(totalDuration)}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => handlePlayGenre(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-lg shadow-accent-shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Genre</span>
            </button>

            <button
              onClick={() => handlePlayGenre(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated text-foreground-secondary border border-border-subtle transition"
            >
              <Shuffle className="w-3.5 h-3.5 text-accent-text" />
              <span>Shuffle</span>
            </button>

            <ExportMenu
              collectionName={selectedGenre}
              source="genre"
              tracks={genreTracks}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-[40px_1fr_1fr_1fr_60px_64px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground-subtle border-b border-border-subtle sticky top-0 bg-app/95 backdrop-blur z-10">
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
          {genreTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const favorited = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onDoubleClick={() => playTrack(track, genreTracks)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu({ x: e.clientX, y: e.clientY, track });
                }}
                className={`group grid grid-cols-[40px_1fr_1fr_1fr_60px_64px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
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
                    onClick={() => playTrack(track, genreTracks)}
                    className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-accent-text hover:text-accent transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <span className={`font-semibold truncate pr-3 ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground'}`}>
                  {track.title}
                </span>

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
