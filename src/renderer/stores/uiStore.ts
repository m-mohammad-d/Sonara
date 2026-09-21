import { create } from 'zustand';
import type { Track } from '../../shared/types';

export type ViewType =
  | 'tracks'
  | 'albums'
  | 'album-detail'
  | 'artists'
  | 'artist-detail'
  | 'genres'
  | 'genre-detail'
  | 'playlists'
  | 'playlist-detail'
  | 'favorites'
  | 'recent'
  | 'settings';

interface ViewHistoryItem {
  view: ViewType;
  selectedAlbumId?: string | null;
  selectedArtistId?: string | null;
  selectedPlaylistId?: string | null;
  selectedGenre?: string | null;
}

interface ContextMenuData {
  x: number;
  y: number;
  track?: Track;
  playlistId?: string;
}

interface UIState {
  currentView: ViewType;
  selectedAlbumId: string | null;
  selectedArtistId: string | null;
  selectedPlaylistId: string | null;
  selectedGenre: string | null;

  isQueueOpen: boolean;
  isEqualizerOpen: boolean;
  isNewPlaylistModalOpen: boolean;
  contextMenu: ContextMenuData | null;

  history: ViewHistoryItem[];
  historyIndex: number;

  navigate: (view: ViewType, params?: Partial<ViewHistoryItem>) => void;
  goBack: () => void;
  goForward: () => void;
  toggleQueue: (open?: boolean) => void;
  toggleEqualizer: (open?: boolean) => void;
  toggleNewPlaylistModal: (open?: boolean) => void;
  openContextMenu: (data: ContextMenuData) => void;
  closeContextMenu: () => void;
}

export const useUIStore = create<UIState>((set, get) => {
  const initialHistoryItem: ViewHistoryItem = {
    view: 'tracks',
    selectedAlbumId: null,
    selectedArtistId: null,
    selectedPlaylistId: null,
    selectedGenre: null,
  };

  return {
    currentView: 'tracks',
    selectedAlbumId: null,
    selectedArtistId: null,
    selectedPlaylistId: null,
    selectedGenre: null,

    isQueueOpen: false,
    isEqualizerOpen: false,
    isNewPlaylistModalOpen: false,
    contextMenu: null,

    history: [initialHistoryItem],
    historyIndex: 0,

    navigate: (view: ViewType, params = {}) => {
      const { history, historyIndex } = get();

      const newItem: ViewHistoryItem = {
        view,
        selectedAlbumId: params.selectedAlbumId ?? null,
        selectedArtistId: params.selectedArtistId ?? null,
        selectedPlaylistId: params.selectedPlaylistId ?? null,
        selectedGenre: params.selectedGenre ?? null,
      };

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newItem);

      set({
        currentView: view,
        selectedAlbumId: newItem.selectedAlbumId,
        selectedArtistId: newItem.selectedArtistId,
        selectedPlaylistId: newItem.selectedPlaylistId,
        selectedGenre: newItem.selectedGenre,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        contextMenu: null,
      });
    },

    goBack: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        const item = history[nextIndex];
        set({
          currentView: item.view,
          selectedAlbumId: item.selectedAlbumId ?? null,
          selectedArtistId: item.selectedArtistId ?? null,
          selectedPlaylistId: item.selectedPlaylistId ?? null,
          selectedGenre: item.selectedGenre ?? null,
          historyIndex: nextIndex,
          contextMenu: null,
        });
      }
    },

    goForward: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const item = history[nextIndex];
        set({
          currentView: item.view,
          selectedAlbumId: item.selectedAlbumId ?? null,
          selectedArtistId: item.selectedArtistId ?? null,
          selectedPlaylistId: item.selectedPlaylistId ?? null,
          selectedGenre: item.selectedGenre ?? null,
          historyIndex: nextIndex,
          contextMenu: null,
        });
      }
    },

    toggleQueue: (open?: boolean) => {
      set({ isQueueOpen: open !== undefined ? open : !get().isQueueOpen });
    },

    toggleEqualizer: (open?: boolean) => {
      set({ isEqualizerOpen: open !== undefined ? open : !get().isEqualizerOpen });
    },

    toggleNewPlaylistModal: (open?: boolean) => {
      set({ isNewPlaylistModalOpen: open !== undefined ? open : !get().isNewPlaylistModalOpen });
    },

    openContextMenu: (data: ContextMenuData) => {
      set({ contextMenu: data });
    },

    closeContextMenu: () => {
      set({ contextMenu: null });
    },
  };
});
