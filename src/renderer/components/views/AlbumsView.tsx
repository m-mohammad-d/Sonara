import React from 'react';
import { Disc3, Play } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { EmptyState } from '../common/EmptyState';

export const AlbumsView: React.FC = () => {
  const { albums, tracks, searchQuery, selectFoldersAndScan } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { navigate } = useUIStore();

  const filteredAlbums = albums.filter((album) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return album.name.toLowerCase().includes(q) || album.artist.toLowerCase().includes(q);
  });

  const handlePlayAlbum = (e: React.MouseEvent, albumTracksIds: string[]) => {
    e.stopPropagation();
    const albumTracks = albumTracksIds.map((id) => tracks[id]).filter(Boolean);
    if (albumTracks.length > 0) {
      playTrack(albumTracks[0], albumTracks);
    }
  };

  if (albums.length === 0) {
    return (
      <EmptyState
        icon={Disc3}
        title="No Albums in Library"
        description="Add music folders to explore albums automatically organized from your tracks."
        actionText="Add Music Folders"
        onAction={selectFoldersAndScan}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="mb-6 pb-4 border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tight">Albums</h1>
        <p className="text-xs text-slate-400 mt-1">
          {filteredAlbums.length} {filteredAlbums.length === 1 ? 'album' : 'albums'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => navigate('album-detail', { selectedAlbumId: album.id })}
              className="group glass-card p-3 rounded-2xl cursor-pointer flex flex-col transition hover:-translate-y-1 duration-150"
            >
              {/* Artwork Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-md border border-white/5 flex items-center justify-center">
                {album.artworkUrl ? (
                  <img
                    src={album.artworkUrl}
                    alt={album.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Disc3 className="w-12 h-12 text-slate-700 group-hover:text-slate-600 transition" />
                )}

                {/* Floating Play Button */}
                <button
                  onClick={(e) => handlePlayAlbum(e, album.trackIds)}
                  className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-90"
                  title="Play Album"
                >
                  <Play className="w-4 h-4 ml-0.5 fill-white" />
                </button>
              </div>

              {/* Title & Artist */}
              <h3 className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-300 transition">
                {album.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {album.artist}
              </p>
              <span className="text-[10px] text-slate-500 mt-1">
                {album.year ? `${album.year} • ` : ''}
                {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
