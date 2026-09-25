import React, { useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { PlayerBar } from './components/layout/PlayerBar';
import { QueuePanel } from './components/queue/QueuePanel';
import { EqualizerModal } from './components/equalizer/EqualizerModal';
import { NewPlaylistModal } from './components/common/NewPlaylistModal';
import { ContextMenu } from './components/common/ContextMenu';
import { TracksView } from './components/views/TracksView';
import { AlbumsView } from './components/views/AlbumsView';
import { AlbumDetailView } from './components/views/AlbumDetailView';
import { ArtistsView } from './components/views/ArtistsView';
import { ArtistDetailView } from './components/views/ArtistDetailView';
import { GenresView } from './components/views/GenresView';
import { GenreDetailView } from './components/views/GenreDetailView';
import { PlaylistsView } from './components/views/PlaylistsView';
import { PlaylistDetailView } from './components/views/PlaylistDetailView';
import { FavoritesView } from './components/views/FavoritesView';
import { RecentView } from './components/views/RecentView';
import { SettingsView } from './components/views/SettingsView';
import { useUIStore } from './stores/uiStore';
import { usePlayerStore } from './stores/playerStore';
import { useSettingsStore } from './stores/settingsStore';
import { useLibraryStore } from './stores/libraryStore';
import { usePlaylistStore } from './stores/playlistStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const currentView = useUIStore((s) => s.currentView);
  const { initSettings } = useSettingsStore();
  const { initPlayer, errorMessage, clearError } = usePlayerStore();
  const { initLibrary } = useLibraryStore();
  const { initPlaylists } = usePlaylistStore();

  useKeyboardShortcuts();

  useEffect(() => {
    initSettings();
    initPlayer();
    initLibrary();
    initPlaylists();
  }, [initSettings, initPlayer, initLibrary, initPlaylists]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tracks':
        return <TracksView />;
      case 'albums':
        return <AlbumsView />;
      case 'album-detail':
        return <AlbumDetailView />;
      case 'artists':
        return <ArtistsView />;
      case 'artist-detail':
        return <ArtistDetailView />;
      case 'genres':
        return <GenresView />;
      case 'genre-detail':
        return <GenreDetailView />;
      case 'playlists':
        return <PlaylistsView />;
      case 'playlist-detail':
        return <PlaylistDetailView />;
      case 'favorites':
        return <FavoritesView />;
      case 'recent':
        return <RecentView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TracksView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-app text-foreground font-sans">
      {/* TitleBar */}
      <TitleBar />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 overflow-hidden flex flex-col bg-app-main">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-between text-xs text-red-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={clearError}
                className="p-1 hover:text-foreground transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {renderCurrentView()}
        </main>

        <QueuePanel />
      </div>

      {/* PlayerBar */}
      <PlayerBar />

      {/* Overlays & Dialogs */}
      <EqualizerModal />
      <NewPlaylistModal />
      <ContextMenu />
    </div>
  );
};
export default App;
