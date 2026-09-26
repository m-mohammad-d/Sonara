import React from 'react';
import {
  Play,
  Heart,
  Music2,
  Clock,
  FolderOpen,
  Shuffle,
  MoreHorizontal,
} from 'lucide-react';
import { useLibraryStore, type SortField } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ExportMenu } from '../export/ExportMenu';
import type { Track } from '../../../shared/types';

export const TracksView: React.FC = () => {
  const {
    getFilteredTracks,
    sortField,
    sortOrder,
    setSort,
    selectFoldersAndScan,
    searchQuery,
  } = useLibraryStore();

  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { toggleFavorite, isFavorite } = usePlaylistStore();
  const { openContextMenu } = useUIStore();

  const tracks = getFilteredTracks();

  const handleTrackDoubleClick = (track: Track) => {
    playTrack(track, tracks);
  };

  const handlePlayAll = (shuffle = false) => {
    if (tracks.length === 0) return;
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks);
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-accent-text font-bold">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  if (tracks.length === 0) {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon={Music2}
          title="No matching tracks found"
          description={`No results for "${searchQuery}". Try searching for another title, artist, or album.`}
        />
      );
    }

    return (
      <EmptyState
        icon={FolderOpen}
        title="Your Music Library is Empty"
        description="Add your local music folders (MP3, FLAC, WAV, M4A, OGG) to start playing your collection."
        actionText="Add Music Folders"
        onAction={selectFoldersAndScan}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      {/* Top Header & Actions */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">All Songs</h1>
          <p className="text-xs text-foreground-muted mt-1">
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {formatTime(totalDuration)} total duration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlayAll(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-sm shadow-accent-shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play All</span>
          </button>

          <button
            onClick={() => handlePlayAll(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated text-foreground-secondary border border-border-subtle transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-accent-text" />
            <span>Shuffle</span>
          </button>

          <ExportMenu
            collectionName={searchQuery.trim() ? `Library (${searchQuery.trim()})` : "Music Library"}
            source="library"
            tracks={tracks}
            label={searchQuery.trim() ? `Export (${tracks.length})` : "Export"}
          />
        </div>
      </div>

      {/* Tracks Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Table Header */}
        <div className="grid grid-cols-[36px_1fr_1fr_1fr_72px_88px_64px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground-subtle border-b border-border-subtle sticky top-0 bg-app/95 backdrop-blur z-10">
          <span>#</span>
          <button
            onClick={() => setSort('title')}
            className="flex items-center text-left hover:text-foreground"
          >
            <span>Title</span>
            {renderSortIndicator('title')}
          </button>
          <button
            onClick={() => setSort('artist')}
            className="flex items-center text-left hover:text-foreground"
          >
            <span>Artist</span>
            {renderSortIndicator('artist')}
          </button>
          <button
            onClick={() => setSort('album')}
            className="flex items-center text-left hover:text-foreground"
          >
            <span>Album</span>
            {renderSortIndicator('album')}
          </button>
          <button
            onClick={() => setSort('duration')}
            className="flex items-center justify-end hover:text-foreground"
          >
            <Clock className="w-3.5 h-3.5" />
            {renderSortIndicator('duration')}
          </button>
          <button
            onClick={() => setSort('dateAdded')}
            className="flex items-center justify-end hover:text-foreground"
          >
            <span>Added</span>
            {renderSortIndicator('dateAdded')}
          </button>
          <span />
        </div>

        {/* Rows */}
        <div className="flex flex-col py-1">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const favorited = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onDoubleClick={() => handleTrackDoubleClick(track)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu({ x: e.clientX, y: e.clientY, track });
                }}
                className={`group grid grid-cols-[36px_1fr_1fr_1fr_72px_88px_64px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  isCurrent
                    ? 'bg-accent-subtle text-accent-text border border-accent-border font-medium'
                    : 'text-foreground-secondary hover:bg-surface-hover border border-transparent'
                }`}
              >
                {/* Index / Play Button */}
                <div className="flex items-center">
                  <span className={`text-[11px] font-mono group-hover:hidden ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground-subtle'}`}>
                    {isCurrent && isPlaying ? '▶' : idx + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track, tracks)}
                    className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-accent-text hover:text-accent transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Title & Artwork */}
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-input shrink-0 flex items-center justify-center border border-border-subtle">
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt={track.album}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music2 className="w-4 h-4 text-foreground-subtle" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isCurrent ? 'text-accent-text font-bold' : 'text-foreground'}`}>
                      {track.title}
                    </p>
                    {track.format && (
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-surface-hover text-foreground-subtle">
                        {track.format}
                      </span>
                    )}
                  </div>
                </div>

                {/* Artist */}
                <span className="truncate text-foreground-muted pr-3 group-hover:text-foreground">
                  {track.artist}
                </span>

                {/* Album */}
                <span className="truncate text-foreground-subtle pr-3 group-hover:text-foreground-muted">
                  {track.album}
                </span>

                {/* Duration */}
                <span className="text-right font-mono text-foreground-muted">
                  {formatTime(track.duration)}
                </span>

                {/* Date Added */}
                <span className="text-right text-[11px] text-foreground-subtle">
                  {formatDate(track.dateAdded)}
                </span>

                {/* Actions: Favorite & More Options */}
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
