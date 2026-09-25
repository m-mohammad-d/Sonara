import React from 'react';
import { Play, Shuffle, Disc3, Clock, ArrowLeft, Heart } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';

export const AlbumDetailView: React.FC = () => {
  const { selectedAlbumId, goBack, navigate, openContextMenu } = useUIStore();
  const { albums, tracks } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { isFavorite, toggleFavorite } = usePlaylistStore();

  const album = albums.find((a) => a.id === selectedAlbumId);

  if (!album) {
    return (
      <div className="p-8 text-center text-foreground-muted">
        <p>Album not found.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface-elevated text-xs font-semibold text-foreground transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const albumTracks = album.trackIds
    .map((id) => tracks[id])
    .filter(Boolean)
    .sort((a, b) => {
      const discA = a.discNo || 1;
      const discB = b.discNo || 1;
      if (discA !== discB) return discA - discB;
      return (a.trackNo || 0) - (b.trackNo || 0);
    });

  const totalDuration = albumTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAlbum = (shuffle = false) => {
    if (albumTracks.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * albumTracks.length);
      playTrack(albumTracks[randIdx], albumTracks);
    } else {
      playTrack(albumTracks[0], albumTracks);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      {/* Top back button */}
      <div className="mb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-xs font-medium text-foreground-muted hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Albums</span>
        </button>
      </div>

      {/* Album Header Banner */}
      <div className="flex items-end gap-6 mb-8 pb-6 border-b border-border-subtle">
        <div className="w-44 h-44 rounded-2xl overflow-hidden bg-surface-input shrink-0 shadow-2xl border border-border flex items-center justify-center">
          {album.artworkUrl ? (
            <img
              src={album.artworkUrl}
              alt={album.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Disc3 className="w-16 h-16 text-foreground-subtle" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-text">
            Album
          </span>
          <h1 className="text-3xl font-black text-foreground tracking-tight truncate mt-1">
            {album.name}
          </h1>

          <p className="text-sm text-foreground-secondary mt-2 font-medium">
            <span
              onClick={() =>
                navigate('artist-detail', {
                  selectedArtistId: album.artist.toLowerCase(),
                })
              }
              className="hover:text-accent-text cursor-pointer transition font-bold"
            >
              {album.artist}
            </span>
            {album.year ? ` • ${album.year}` : ''} • {album.trackCount} tracks • {formatTime(totalDuration)}
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => handlePlayAlbum(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-lg shadow-accent-shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Album</span>
            </button>

            <button
              onClick={() => handlePlayAlbum(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated text-foreground-secondary border border-border-subtle transition"
            >
              <Shuffle className="w-3.5 h-3.5 text-accent-text" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-[40px_1fr_1fr_60px_40px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground-subtle border-b border-border-subtle sticky top-0 bg-app/95 backdrop-blur z-10">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span className="flex justify-end">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <span />
        </div>

        <div className="flex flex-col py-1">
          {albumTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const favorited = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onDoubleClick={() => playTrack(track, albumTracks)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu({ x: e.clientX, y: e.clientY, track });
                }}
                className={`group grid grid-cols-[40px_1fr_1fr_60px_40px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  isCurrent
                    ? 'bg-accent-subtle text-accent-text border border-accent-border font-medium'
                    : 'text-foreground-secondary hover:bg-surface-hover border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <span className={`text-[11px] font-mono group-hover:hidden ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground-subtle'}`}>
                    {isCurrent && isPlaying ? '▶' : track.trackNo || idx + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track, albumTracks)}
                    className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-accent-text hover:text-accent transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="truncate pr-3">
                  <p className={`font-semibold truncate ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground'}`}>
                    {track.title}
                  </p>
                </div>

                <span className="truncate text-foreground-muted pr-3">
                  {track.artist}
                </span>

                <span className="text-right font-mono text-foreground-muted">
                  {formatTime(track.duration)}
                </span>

                <div className="flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="p-1 text-foreground-subtle hover:text-red-400 transition"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        favorited ? 'text-red-400 fill-red-400' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
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
