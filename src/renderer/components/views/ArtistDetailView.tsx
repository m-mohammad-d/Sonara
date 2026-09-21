import React from 'react';
import { Play, Shuffle, Users, Disc3, Clock, ArrowLeft, Heart } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useUIStore } from '../../stores/uiStore';
import { formatTime } from '../../utils/formatters';

export const ArtistDetailView: React.FC = () => {
  const { selectedArtistId, goBack, navigate, openContextMenu } = useUIStore();
  const { artists, albums, tracks } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { isFavorite, toggleFavorite } = usePlaylistStore();

  const artist = artists.find((a) => a.id === selectedArtistId);

  if (!artist) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Artist not found.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get albums by this artist
  const artistAlbums = albums.filter((alb) =>
    alb.artist.toLowerCase() === artist.name.toLowerCase()
  );

  // Get all tracks by this artist
  const artistTracks = Object.values(tracks)
    .filter((tr) => tr.artist.toLowerCase() === artist.name.toLowerCase())
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const handlePlayArtist = (shuffle = false) => {
    if (artistTracks.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * artistTracks.length);
      playTrack(artistTracks[randIdx], artistTracks);
    } else {
      playTrack(artistTracks[0], artistTracks);
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
          <span>Back to Artists</span>
        </button>
      </div>

      {/* Artist Banner */}
      <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/5">
        <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-900 shrink-0 shadow-2xl border border-white/10 flex items-center justify-center">
          {artist.artworkUrl ? (
            <img
              src={artist.artworkUrl}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users className="w-16 h-16 text-slate-700" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            Artist
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight truncate mt-1">
            {artist.name}
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            {artistAlbums.length} {artistAlbums.length === 1 ? 'album' : 'albums'} • {artistTracks.length} tracks
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => handlePlayArtist(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => handlePlayArtist(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 transition"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-8">
        {/* Albums Row */}
        {artistAlbums.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-white mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artistAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => navigate('album-detail', { selectedAlbumId: alb.id })}
                  className="group glass-card p-2.5 rounded-2xl cursor-pointer flex flex-col transition hover:-translate-y-1 duration-150"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-2.5 flex items-center justify-center">
                    {alb.artworkUrl ? (
                      <img
                        src={alb.artworkUrl}
                        alt={alb.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Disc3 className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300">
                    {alb.name}
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {alb.year || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Songs List */}
        <div>
          <h2 className="text-base font-bold text-white mb-4">Songs</h2>
          <div className="grid grid-cols-[40px_1fr_1fr_60px_40px] items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 sticky top-0 bg-[#0b0d14]/95 backdrop-blur z-10">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span className="flex justify-end">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span />
          </div>

          <div className="flex flex-col py-1">
            {artistTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const favorited = isFavorite(track.id);

              return (
                <div
                  key={track.id}
                  onDoubleClick={() => playTrack(track, artistTracks)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openContextMenu({ x: e.clientX, y: e.clientY, track });
                  }}
                  className={`group grid grid-cols-[40px_1fr_1fr_60px_40px] items-center px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
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
                      onClick={() => playTrack(track, artistTracks)}
                      className="hidden group-hover:flex w-5 h-5 rounded items-center justify-center text-indigo-400 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <span className={`font-semibold truncate pr-3 ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                    {track.title}
                  </span>

                  <span className="truncate text-slate-400 pr-3">
                    {track.album}
                  </span>

                  <span className="text-right font-mono text-slate-400">
                    {formatTime(track.duration)}
                  </span>

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
    </div>
  );
};
