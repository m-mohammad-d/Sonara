import React from 'react';
import {
  Music,
  Disc3,
  Users,
  Radio,
  Heart,
  History,
  Plus,
  Settings,
  ListMusic,
} from 'lucide-react';
import { useUIStore, type ViewType } from '../../stores/uiStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useLibraryStore } from '../../stores/libraryStore';

export const Sidebar: React.FC = () => {
  const { currentView, selectedPlaylistId, navigate, toggleNewPlaylistModal } = useUIStore();
  const { playlists, favorites } = usePlaylistStore();
  const { tracks, folders } = useLibraryStore();

  const totalTracks = Object.keys(tracks).length;
  const playlistItems = Object.values(playlists);

  const navItem = (view: ViewType, label: string, icon: React.ReactNode, count?: number) => {
    const isActive = currentView === view && (!selectedPlaylistId || view !== 'playlist-detail');

    return (
      <button
        onClick={() => navigate(view)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        {count !== undefined && count > 0 && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-indigo-700 text-white' : 'bg-white/5 text-slate-400'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-56 h-full bg-[#0d101a] border-r border-white/5 flex flex-col justify-between select-none">
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        {/* Main Library Section */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
            Library
          </span>
          <div className="flex flex-col gap-1">
            {navItem('tracks', 'All Songs', <Music className="w-4 h-4" />, totalTracks)}
            {navItem('albums', 'Albums', <Disc3 className="w-4 h-4" />)}
            {navItem('artists', 'Artists', <Users className="w-4 h-4" />)}
            {navItem('genres', 'Genres', <Radio className="w-4 h-4" />)}
          </div>
        </div>

        {/* Collections */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
            Collections
          </span>
          <div className="flex flex-col gap-1">
            {navItem('favorites', 'Favorites', <Heart className="w-4 h-4" />, favorites.length)}
            {navItem('recent', 'Recently Played', <History className="w-4 h-4" />)}
          </div>
        </div>

        {/* Playlists */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Playlists
            </span>
            <button
              onClick={() => toggleNewPlaylistModal(true)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition"
              title="Create New Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-48 pr-1">
            {playlistItems.length === 0 ? (
              <span className="text-[11px] text-slate-600 px-3 italic">
                No playlists yet
              </span>
            ) : (
              playlistItems.map((pl) => {
                const isActive = currentView === 'playlist-detail' && selectedPlaylistId === pl.id;
                return (
                  <button
                    key={pl.id}
                    onClick={() => navigate('playlist-detail', { selectedPlaylistId: pl.id })}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition text-left truncate ${
                      isActive
                        ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ListMusic className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{pl.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {pl.trackIds.length}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2">
        <button
          onClick={() => navigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'settings'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {folders.length > 0 && (
          <div className="text-[10px] text-slate-500 px-3 truncate">
            {folders.length} folder{folders.length > 1 ? 's' : ''} monitored
          </div>
        )}
      </div>
    </aside>
  );
};
