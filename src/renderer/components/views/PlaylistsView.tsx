import React from 'react';
import { ListMusic, Plus, Play, Trash2 } from 'lucide-react';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { EmptyState } from '../common/EmptyState';

export const PlaylistsView: React.FC = () => {
  const { playlists, deletePlaylist } = usePlaylistStore();
  const { tracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { navigate, toggleNewPlaylistModal } = useUIStore();

  const playlistItems = Object.values(playlists);

  const handlePlayPlaylist = (e: React.MouseEvent, trackIds: string[]) => {
    e.stopPropagation();
    const plTracks = trackIds.map((id) => tracks[id]).filter(Boolean);
    if (plTracks.length > 0) {
      playTrack(plTracks[0], plTracks);
    }
  };

  const handleDelete = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    deletePlaylist(playlistId);
  };

  if (playlistItems.length === 0) {
    return (
      <EmptyState
        icon={ListMusic}
        title="No Playlists Created Yet"
        description="Create custom playlists to organize your music by mood, activity, or favorites."
        actionText="Create New Playlist"
        onAction={() => toggleNewPlaylistModal(true)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Playlists</h1>
          <p className="text-xs text-slate-400 mt-1">
            {playlistItems.length} {playlistItems.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>

        <button
          onClick={() => toggleNewPlaylistModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm shadow-indigo-500/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-6">
          {playlistItems.map((pl) => {
            const firstTrack = pl.trackIds[0] ? tracks[pl.trackIds[0]] : null;

            return (
              <div
                key={pl.id}
                onClick={() => navigate('playlist-detail', { selectedPlaylistId: pl.id })}
                className="group glass-card p-3.5 rounded-2xl cursor-pointer flex flex-col transition hover:-translate-y-1 duration-150"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-md flex items-center justify-center border border-white/5">
                  {firstTrack?.artworkUrl ? (
                    <img
                      src={firstTrack.artworkUrl}
                      alt={pl.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ListMusic className="w-12 h-12 text-slate-700 group-hover:text-slate-600 transition" />
                  )}

                  {pl.trackIds.length > 0 && (
                    <button
                      onClick={(e) => handlePlayPlaylist(e, pl.trackIds)}
                      className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-90"
                      title="Play Playlist"
                    >
                      <Play className="w-4 h-4 ml-0.5 fill-white" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-300">
                      {pl.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {pl.trackIds.length} {pl.trackIds.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, pl.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
