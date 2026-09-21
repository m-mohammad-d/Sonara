import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  ListMusic,
  Clock,
  ArrowLeft,
  Trash2,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  Heart,
} from 'lucide-react';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';

export const PlaylistDetailView: React.FC = () => {
  const { selectedPlaylistId, goBack, openContextMenu } = useUIStore();
  const { playlists, renamePlaylist, deletePlaylist, removeTrackFromPlaylist, reorderPlaylistTracks, isFavorite, toggleFavorite } = usePlaylistStore();
  const { tracks } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  const playlist = selectedPlaylistId ? playlists[selectedPlaylistId] : null;

  if (!playlist) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Playlist not found or deleted.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs text-white">
          Go Back
        </button>
      </div>
    );
  }

  const playlistTracks = playlist.trackIds
    .map((id) => tracks[id])
    .filter(Boolean);

  const totalDuration = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handleStartEdit = () => {
    setEditedName(playlist.name);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedName.trim()) {
      await renamePlaylist(playlist.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete playlist "${playlist.name}"?`)) {
      await deletePlaylist(playlist.id);
      goBack();
    }
  };

  const handlePlayPlaylist = (shuffle = false) => {
    if (playlistTracks.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * playlistTracks.length);
      playTrack(playlistTracks[randIdx], playlistTracks);
    } else {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="mb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Playlists</span>
        </button>
      </div>

      {/* Playlist Header */}
      <div className="flex items-end gap-6 mb-8 pb-6 border-b border-white/5">
        <div className="w-40 h-40 rounded-2xl overflow-hidden bg-slate-900 shrink-0 shadow-2xl border border-white/10 flex items-center justify-center">
          {playlistTracks[0]?.artworkUrl ? (
            <img
              src={playlistTracks[0].artworkUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ListMusic className="w-16 h-16 text-indigo-400/60" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            Playlist
          </span>

          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="text-2xl font-black text-white bg-slate-900/80 px-3 py-1 rounded-xl border border-indigo-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="p-2 text-emerald-400 hover:bg-white/10 rounded-lg transition"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-3xl font-black text-white tracking-tight truncate">
                {playlist.name}
              </h1>
              <button
                onClick={handleStartEdit}
                className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition"
                title="Rename Playlist"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {playlist.description && (
            <p className="text-xs text-slate-400 mt-1.5">{playlist.description}</p>
          )}

          <p className="text-xs text-slate-400 mt-2 font-medium">
            {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'} • {formatTime(totalDuration)}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => handlePlayPlaylist(false)}
              disabled={playlistTracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-lg shadow-indigo-600/30"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play</span>
            </button>

            <button
              onClick={() => handlePlayPlaylist(true)}
              disabled={playlistTracks.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-200 transition"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition ml-auto"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Tracks Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        {playlistTracks.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            This playlist has no songs yet. Right-click any track in your library to add it here.
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[36px_1fr_1fr_1fr_60px_90px_40px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 sticky top-0 bg-[#0b0d14]/95 backdrop-blur z-10">
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span className="flex justify-end">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <span className="text-center">Order</span>
              <span />
            </div>

            <div className="flex flex-col py-1">
              {playlistTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const favorited = isFavorite(track.id);

                return (
                  <div
                    key={`${track.id}_${idx}`}
                    onDoubleClick={() => playTrack(track, playlistTracks)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openContextMenu({ x: e.clientX, y: e.clientY, track });
                    }}
                    className={`group grid grid-cols-[36px_1fr_1fr_1fr_60px_90px_40px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
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
                        onClick={() => playTrack(track, playlistTracks)}
                        className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-indigo-400 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <span className={`font-semibold truncate pr-3 ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                      {track.title}
                    </span>

                    <span className="truncate text-slate-400 pr-3">{track.artist}</span>
                    <span className="truncate text-slate-500 pr-3">{track.album}</span>
                    <span className="text-right font-mono text-slate-400">{formatTime(track.duration)}</span>

                    {/* Reorder controls */}
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {idx > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderPlaylistTracks(playlist.id, idx, idx - 1);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < playlistTracks.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderPlaylistTracks(playlist.id, idx, idx + 1);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrackFromPlaylist(playlist.id, idx);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="Remove from playlist"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

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
        )}
      </div>
    </div>
  );
};
