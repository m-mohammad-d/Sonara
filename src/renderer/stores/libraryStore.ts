import { create } from 'zustand';
import type { Track, Album, Artist, ScanProgress } from '../../shared/types';

export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded';
export type SortOrder = 'asc' | 'desc';

interface LibraryState {
  tracks: Record<string, Track>;
  albums: Album[];
  artists: Artist[];
  genres: string[];
  folders: string[];
  scanProgress: ScanProgress | null;
  isScanning: boolean;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;

  initLibrary: () => Promise<void>;
  loadLibrary: () => Promise<void>;
  scanFolders: (folders?: string[]) => Promise<void>;
  selectFoldersAndScan: () => Promise<void>;
  cancelScan: () => Promise<void>;
  removeFolder: (folder: string) => Promise<void>;
  addExternalTracks: (tracks: Track[]) => void;
  setSearchQuery: (query: string) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  getFilteredTracks: () => Track[];
}

function deriveCollections(tracks: Record<string, Track>) {
  const albumsMap = new Map<string, Album>();
  const artistsMap = new Map<string, Artist>();
  const genresSet = new Set<string>();

  const trackList = Object.values(tracks);

  for (const track of trackList) {
    if (track.genre) {
      genresSet.add(track.genre);
    }

    // Process Album
    const albumKey = `${track.album.toLowerCase()}___${(track.albumArtist || track.artist).toLowerCase()}`;
    let album = albumsMap.get(albumKey);
    if (!album) {
      album = {
        id: albumKey,
        name: track.album,
        artist: track.albumArtist || track.artist,
        year: track.year,
        artworkUrl: track.artworkUrl,
        trackCount: 0,
        trackIds: [],
      };
      albumsMap.set(albumKey, album);
    }
    album.trackCount++;
    album.trackIds.push(track.id);
    if (!album.artworkUrl && track.artworkUrl) {
      album.artworkUrl = track.artworkUrl;
    }
    if (!album.year && track.year) {
      album.year = track.year;
    }

    // Process Artist
    const artistKey = track.artist.toLowerCase();
    let artist = artistsMap.get(artistKey);
    if (!artist) {
      artist = {
        id: artistKey,
        name: track.artist,
        trackCount: 0,
        albumCount: 0,
        artworkUrl: track.artworkUrl,
        albumIds: [],
      };
      artistsMap.set(artistKey, artist);
    }
    artist.trackCount++;
    if (!artist.artworkUrl && track.artworkUrl) {
      artist.artworkUrl = track.artworkUrl;
    }
    if (!artist.albumIds.includes(albumKey)) {
      artist.albumIds.push(albumKey);
      artist.albumCount = artist.albumIds.length;
    }
  }

  const sortedAlbums = Array.from(albumsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  const sortedArtists = Array.from(artistsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  const sortedGenres = Array.from(genresSet).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  return {
    albums: sortedAlbums,
    artists: sortedArtists,
    genres: sortedGenres,
  };
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: {},
  albums: [],
  artists: [],
  genres: [],
  folders: [],
  scanProgress: null,
  isScanning: false,
  searchQuery: '',
  sortField: 'title',
  sortOrder: 'asc',
  isLoading: true,

  initLibrary: async () => {
    // Register scan progress listener
    window.electronAPI.onScanProgress((progress) => {
      set({
        scanProgress: progress,
        isScanning: progress.isScanning,
      });

      // When scan finishes, reload library
      if (!progress.isScanning) {
        get().loadLibrary();
      }
    });

    await get().loadLibrary();
  },

  loadLibrary: async () => {
    try {
      const data = await window.electronAPI.getLibrary();
      const derived = deriveCollections(data.tracks || {});
      set({
        tracks: data.tracks || {},
        folders: data.folders || [],
        albums: derived.albums,
        artists: derived.artists,
        genres: derived.genres,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load library:', err);
      set({ isLoading: false });
    }
  },

  selectFoldersAndScan: async () => {
    try {
      const selected = await window.electronAPI.selectFolders();
      if (selected && selected.length > 0) {
        await get().scanFolders(selected);
      }
    } catch (err) {
      console.error('Failed to open folders:', err);
    }
  },

  scanFolders: async (folders?: string[]) => {
    set({ isScanning: true });
    try {
      const updatedLib = await window.electronAPI.scanLibrary(folders);
      const derived = deriveCollections(updatedLib.tracks || {});
      set({
        tracks: updatedLib.tracks || {},
        folders: updatedLib.folders || [],
        albums: derived.albums,
        artists: derived.artists,
        genres: derived.genres,
        isScanning: false,
      });
    } catch (err) {
      console.error('Scan failed:', err);
      set({ isScanning: false });
    }
  },

  cancelScan: async () => {
    try {
      await window.electronAPI.cancelScan();
      set({ isScanning: false, scanProgress: null });
    } catch (err) {
      console.error('Failed to cancel scan:', err);
    }
  },

  removeFolder: async (folder: string) => {
    try {
      const updatedLib = await window.electronAPI.removeFolder(folder);
      const derived = deriveCollections(updatedLib.tracks || {});
      set({
        tracks: updatedLib.tracks || {},
        folders: updatedLib.folders || [],
        albums: derived.albums,
        artists: derived.artists,
        genres: derived.genres,
      });
    } catch (err) {
      console.error('Failed to remove folder:', err);
    }
  },

  addExternalTracks: (newTracks: Track[]) => {
    if (!newTracks || newTracks.length === 0) return;
    const currentTracks = { ...get().tracks };
    let changed = false;
    for (const track of newTracks) {
      if (!currentTracks[track.id]) {
        currentTracks[track.id] = track;
        changed = true;
      }
    }
    if (changed) {
      const derived = deriveCollections(currentTracks);
      set({
        tracks: currentTracks,
        albums: derived.albums,
        artists: derived.artists,
        genres: derived.genres,
      });
    }
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  setSort: (field: SortField, order?: SortOrder) => {
    const currentField = get().sortField;
    const currentOrder = get().sortOrder;

    if (!order) {
      if (currentField === field) {
        order = currentOrder === 'asc' ? 'desc' : 'asc';
      } else {
        order = 'asc';
      }
    }

    set({ sortField: field, sortOrder: order });
  },

  getFilteredTracks: () => {
    const { tracks, searchQuery, sortField, sortOrder } = get();
    let list = Object.values(tracks);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          (t.genre && t.genre.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          break;
        case 'artist':
          cmp = a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });
          break;
        case 'album':
          cmp = a.album.localeCompare(b.album, undefined, { sensitivity: 'base' });
          break;
        case 'duration':
          cmp = (a.duration || 0) - (b.duration || 0);
          break;
        case 'dateAdded':
          cmp = (a.dateAdded || 0) - (b.dateAdded || 0);
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  },
}));
