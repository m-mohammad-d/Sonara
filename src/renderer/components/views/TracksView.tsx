import React from 'react';
import {
  Play,
  Heart,
  Music2,
  Clock,
  FolderOpen,
  Shuffle,
} from 'lucide-react';
import { useLibraryStore, type SortField } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
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
      <span className="ml-1 text-indigo-400 font-bold">
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
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">All Songs</h1>
          <p className="text-xs text-slate-400 mt-1">
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {formatTime(totalDuration)} total duration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlayAll(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm shadow-indigo-500/30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play All</span>
          </button>

          <button
            onClick={() => handlePlayAll(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Table Header */}
        <div className="grid grid-cols-[36px_1fr_1fr_1fr_72px_88px_40px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 sticky top-0 bg-[#0b0d14]/95 backdrop-blur z-10">
          <span>#</span>
          <button
            onClick={() => setSort('title')}
            className="flex items-center text-left hover:text-slate-300"
          >
            <span>Title</span>
            {renderSortIndicator('title')}
          </button>
          <button
            onClick={() => setSort('artist')}
            className="flex items-center text-left hover:text-slate-300"
          >
            <span>Artist</span>
            {renderSortIndicator('artist')}
          </button>
          <button
            onClick={() => setSort('album')}
            className="flex items-center text-left hover:text-slate-300"
          >
            <span>Album</span>
            {renderSortIndicator('album')}
          </button>
          <button
            onClick={() => setSort('duration')}
            className="flex items-center justify-end hover:text-slate-300"
          >
            <Clock className="w-3.5 h-3.5" />
            {renderSortIndicator('duration')}
          </button>
          <button
            onClick={() => setSort('dateAdded')}
            className="flex items-center justify-end hover:text-slate-300"
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
                className={`group grid grid-cols-[36px_1fr_1fr_1fr_72px_88px_40px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Index / Play Button */}
                <div className="flex items-center">
                  <span className={`text-[11px] font-mono group-hover:hidden ${isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                    {isCurrent && isPlaying ? '▶' : idx + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track, tracks)}
                    className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Title & Artwork */}
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center border border-white/5">
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt={track.album}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music2 className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isCurrent ? 'text-white font-bold' : 'text-slate-200'}`}>
                      {track.title}
                    </p>
                    {track.format && (
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-white/5 text-slate-500">
                        {track.format}
                      </span>
                    )}
                  </div>
                </div>

                {/* Artist */}
                <span className="truncate text-slate-400 pr-3 group-hover:text-slate-300">
                  {track.artist}
                </span>

                {/* Album */}
                <span className="truncate text-slate-500 pr-3 group-hover:text-slate-400">
                  {track.album}
                </span>

                {/* Duration */}
                <span className="text-right font-mono text-slate-400">
                  {formatTime(track.duration)}
                </span>

                {/* Date Added */}
                <span className="text-right text-[11px] text-slate-500">
                  {formatDate(track.dateAdded)}
                </span>

                {/* Favorite Action */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
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
