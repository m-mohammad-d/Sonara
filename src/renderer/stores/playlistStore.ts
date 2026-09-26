import { create } from 'zustand';
import type { Playlist } from '../../shared/types';

interface PlaylistState {
  playlists: Record<string, Playlist>;
  favorites: string[];
  recentlyPlayed: string[];

  initPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, index: number) => Promise<void>;
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  handleTrackRemoved: (trackId: string) => void;
  clearAll: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: {},
  favorites: [],
  recentlyPlayed: [],

  initPlaylists: async () => {
    try {
      const data = await window.electronAPI.getLibrary();
      set({
        playlists: data.playlists || {},
        favorites: data.favorites || [],
        recentlyPlayed: data.recentlyPlayed || [],
      });
    } catch (err) {
      console.error('Failed to init playlists:', err);
    }
  },

  createPlaylist: async (name: string, description?: string) => {
    const id = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newPlaylist: Playlist = {
      id,
      name: name.trim() || 'Untitled Playlist',
      description: description?.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trackIds: [],
    };

    set({
      playlists: {
        ...get().playlists,
        [id]: newPlaylist,
      },
    });

    await window.electronAPI.savePlaylist(newPlaylist);
    return newPlaylist;
  },

  renamePlaylist: async (id: string, name: string) => {
    const playlist = get().playlists[id];
    if (!playlist) return;

    const updated: Playlist = {
      ...playlist,
      name: name.trim() || playlist.name,
      updatedAt: Date.now(),
    };

    set({
      playlists: {
        ...get().playlists,
        [id]: updated,
      },
    });

    await window.electronAPI.savePlaylist(updated);
  },

  deletePlaylist: async (id: string) => {
    const updated = { ...get().playlists };
    delete updated[id];
    set({ playlists: updated });
    await window.electronAPI.deletePlaylist(id);
  },

  addTracksToPlaylist: async (playlistId: string, trackIds: string[]) => {
    const playlist = get().playlists[playlistId];
    if (!playlist) return;

    const currentIds = [...playlist.trackIds];
    for (const tid of trackIds) {
      if (!currentIds.includes(tid)) {
        currentIds.push(tid);
      }
    }

    const updated: Playlist = {
      ...playlist,
      trackIds: currentIds,
      updatedAt: Date.now(),
    };

    set({
      playlists: {
        ...get().playlists,
        [playlistId]: updated,
      },
    });

    await window.electronAPI.savePlaylist(updated);
  },

  removeTrackFromPlaylist: async (playlistId: string, index: number) => {
    const playlist = get().playlists[playlistId];
    if (!playlist) return;

    const currentIds = [...playlist.trackIds];
    currentIds.splice(index, 1);

    const updated: Playlist = {
      ...playlist,
      trackIds: currentIds,
      updatedAt: Date.now(),
    };

    set({
      playlists: {
        ...get().playlists,
        [playlistId]: updated,
      },
    });

    await window.electronAPI.savePlaylist(updated);
  },

  reorderPlaylistTracks: async (playlistId: string, fromIndex: number, toIndex: number) => {
    const playlist = get().playlists[playlistId];
    if (!playlist) return;

    const currentIds = [...playlist.trackIds];
    if (fromIndex < 0 || fromIndex >= currentIds.length || toIndex < 0 || toIndex >= currentIds.length) return;

    const [moved] = currentIds.splice(fromIndex, 1);
    currentIds.splice(toIndex, 0, moved);

    const updated: Playlist = {
      ...playlist,
      trackIds: currentIds,
      updatedAt: Date.now(),
    };

    set({
      playlists: {
        ...get().playlists,
        [playlistId]: updated,
      },
    });

    await window.electronAPI.savePlaylist(updated);
  },

  toggleFavorite: async (trackId: string) => {
    const favorites = await window.electronAPI.toggleFavorite(trackId);
    set({ favorites });
  },

  isFavorite: (trackId: string) => {
    return get().favorites.includes(trackId);
  },

  handleTrackRemoved: (trackId: string) => {
    const { playlists, favorites, recentlyPlayed } = get();
    const updatedFavorites = favorites.filter((id) => id !== trackId);
    const updatedRecent = recentlyPlayed.filter((id) => id !== trackId);
    const updatedPlaylists: Record<string, Playlist> = {};
    for (const [id, pl] of Object.entries(playlists)) {
      if (pl.trackIds && pl.trackIds.includes(trackId)) {
        updatedPlaylists[id] = {
          ...pl,
          trackIds: pl.trackIds.filter((tId) => tId !== trackId),
          updatedAt: Date.now(),
        };
      } else {
        updatedPlaylists[id] = pl;
      }
    }
    set({
      favorites: updatedFavorites,
      recentlyPlayed: updatedRecent,
      playlists: updatedPlaylists,
    });
  },

  clearAll: () => {
    set({
      playlists: {},
      favorites: [],
      recentlyPlayed: [],
    });
  },
}));
