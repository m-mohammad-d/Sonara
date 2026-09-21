import React from 'react';
import { Radio } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useUIStore } from '../../stores/uiStore';
import { EmptyState } from '../common/EmptyState';

export const GenresView: React.FC = () => {
  const { genres, tracks, searchQuery, selectFoldersAndScan } = useLibraryStore();
  const { navigate } = useUIStore();

  const filteredGenres = genres.filter((g) => {
    if (!searchQuery.trim()) return true;
    return g.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const getGenreCount = (genre: string) => {
    return Object.values(tracks).filter((t) => t.genre === genre).length;
  };

  if (genres.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        title="No Genres Found"
        description="Music genres tagged in your audio files will be automatically grouped here."
        actionText="Add Music Folders"
        onAction={selectFoldersAndScan}
      />
    );
  }

  // Predefined vibrant gradient styles for genres
  const gradients = [
    'from-indigo-600/30 to-purple-600/20 border-indigo-500/20',
    'from-rose-600/30 to-orange-600/20 border-rose-500/20',
    'from-cyan-600/30 to-blue-600/20 border-cyan-500/20',
    'from-emerald-600/30 to-teal-600/20 border-emerald-500/20',
    'from-amber-600/30 to-yellow-600/20 border-amber-500/20',
    'from-fuchsia-600/30 to-pink-600/20 border-fuchsia-500/20',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 select-none">
      <div className="mb-6 pb-4 border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tight">Genres</h1>
        <p className="text-xs text-slate-400 mt-1">
          {filteredGenres.length} {filteredGenres.length === 1 ? 'genre' : 'genres'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-6">
          {filteredGenres.map((genre, idx) => {
            const count = getGenreCount(genre);
            const gradient = gradients[idx % gradients.length];

            return (
              <div
                key={genre}
                onClick={() => navigate('genre-detail', { selectedGenre: genre })}
                className={`p-5 rounded-2xl cursor-pointer bg-gradient-to-br ${gradient} border transition hover:-translate-y-1 hover:shadow-xl duration-150 flex flex-col justify-between h-32`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Radio className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white truncate">{genre}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {count} {count === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
