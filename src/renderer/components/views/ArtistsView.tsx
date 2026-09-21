import React from 'react';
import { Users } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useUIStore } from '../../stores/uiStore';
import { EmptyState } from '../common/EmptyState';

export const ArtistsView: React.FC = () => {
  const { artists, searchQuery, selectFoldersAndScan } = useLibraryStore();
  const { navigate } = useUIStore();

  const filteredArtists = artists.filter((artist) => {
    if (!searchQuery.trim()) return true;
    return artist.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  if (artists.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Artists in Library"
        description="Add your music folders to discover and organize artists across your collection."
        actionText="Add Music Folders"
        onAction={selectFoldersAndScan}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="mb-6 pb-4 border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tight">Artists</h1>
        <p className="text-xs text-slate-400 mt-1">
          {filteredArtists.length} {filteredArtists.length === 1 ? 'artist' : 'artists'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-6">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => navigate('artist-detail', { selectedArtistId: artist.id })}
              className="group glass-card p-4 rounded-2xl cursor-pointer flex flex-col items-center text-center transition hover:-translate-y-1 duration-150"
            >
              {/* Avatar circle */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden bg-slate-900 mb-3 shadow-lg border border-white/5 flex items-center justify-center">
                {artist.artworkUrl ? (
                  <img
                    src={artist.artworkUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Users className="w-10 h-10 text-slate-700 group-hover:text-slate-600 transition" />
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-100 truncate w-full group-hover:text-indigo-300 transition">
                {artist.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {artist.albumCount} {artist.albumCount === 1 ? 'album' : 'albums'} • {artist.trackCount} songs
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
