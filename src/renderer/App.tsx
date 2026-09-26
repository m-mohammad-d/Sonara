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
import { useSleepTimerStore } from './stores/sleepTimerStore';
import { useFileDrop } from './hooks/useFileDrop';
import { DragDropOverlay } from './components/common/DragDropOverlay';
import { AlertCircle, X, Moon } from 'lucide-react';
import { removeTrackFromLibrary } from './services/trackRemovalService';

export const App: React.FC = () => {
  const currentView = useUIStore((s) => s.currentView);
  const toast = useUIStore((s) => s.toast);
  const clearToast = useUIStore((s) => s.clearToast);
  const { initSettings } = useSettingsStore();
  const { initPlayer, errorMessage, clearError, currentTrack } = usePlayerStore();
  const { initLibrary } = useLibraryStore();
  const { initPlaylists } = usePlaylistStore();
  const { isDragging, isProcessing } = useFileDrop();

  useKeyboardShortcuts();

  useEffect(() => {
    const init = async () => {
      await initSettings();
      useSleepTimerStore.getState().initSleepTimer();
    };
    init();
    initPlayer();
    initLibrary();
    initPlaylists();

    const handleExternalFiles = async (filePaths: string[]) => {
      if (!filePaths || filePaths.length === 0) return;
      try {
        const tracks = await window.electronAPI.resolveTracks(filePaths);
        if (tracks && tracks.length > 0) {
          useLibraryStore.getState().addExternalTracks(tracks);
          await usePlayerStore.getState().playTrack(tracks[0], tracks);
        }
      } catch (err) {
        console.error('Failed to open external audio files:', err);
      }
    };

    const unsubscribeFiles = window.electronAPI.onOpenFiles((filePaths) => {
      handleExternalFiles(filePaths);
    });

    window.electronAPI.getPendingFiles().then((pending) => {
      if (pending && pending.length > 0) {
        handleExternalFiles(pending);
      }
    });

    return () => {
      unsubscribeFiles();
    };
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
              <div className="flex items-center gap-2">
                {currentTrack && (
                  <button
                    onClick={() => {
                      const track = currentTrack;
                      clearError();
                      removeTrackFromLibrary(track);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white transition text-[11px] font-medium"
                  >
                    Remove from Library
                  </button>
                )}
                <button
                  onClick={clearError}
                  className="p-1 hover:text-foreground transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
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
      <DragDropOverlay isDragging={isDragging} isProcessing={isProcessing} />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-panel shadow-2xl border border-accent-border/50 bg-surface-elevated/95 animate-in fade-in slide-in-from-bottom-2 duration-200 text-foreground"
        >
          <div className="p-2 rounded-xl bg-accent-subtle text-accent-text shrink-0">
            <Moon className="w-4 h-4" />
          </div>
          <div className="flex flex-col pr-1">
            <p className="text-xs font-bold text-foreground">{toast.title}</p>
            <p className="text-[11px] text-foreground-muted">{toast.message}</p>
          </div>
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                clearToast();
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-accent text-accent-fg hover:bg-accent-hover font-semibold transition shrink-0 ml-1 shadow-sm"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={clearToast}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
export default App;
