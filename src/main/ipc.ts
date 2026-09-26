import { ipcMain, dialog, shell, BrowserWindow, Notification, globalShortcut } from "electron";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { IPC_CHANNELS } from "../shared/channels";
import type { AppStore } from "./store";
import type { LibraryScanner } from "./scanner";
import type { Track, Playlist, UserSettings, MediaCommand, FileImportResult } from "../shared/types";
import { SUPPORTED_AUDIO_EXTENSIONS } from "./fileArgs";
import type { ExportRequest } from "../shared/export/types";
import { handleExportMusicList } from "./export/exportManager";

export function registerIpcHandlers(
  store: AppStore,
  scanner: LibraryScanner,
  getMainWindow: () => BrowserWindow | null,
  getPendingFiles?: () => string[],
): void {
  // Select folder dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FOLDERS, async () => {
    const win = getMainWindow();
    if (!win) return [];
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory", "multiSelections"],
      title: "Select Music Folders",
    });
    if (result.canceled) return [];
    return result.filePaths;
  });

  // Get entire library
  ipcMain.handle(IPC_CHANNELS.LIBRARY_GET_ALL, () => {
    return store.getLibrary();
  });

  // Scan library
  ipcMain.handle(
    IPC_CHANNELS.LIBRARY_SCAN,
    async (_event, targetFolders?: string[]) => {
      const currentLib = store.getLibrary();
      const foldersToScan =
        targetFolders && targetFolders.length > 0
          ? targetFolders
          : currentLib.folders;

      // Merge folders into store
      const uniqueFolders = Array.from(
        new Set([...currentLib.folders, ...foldersToScan]),
      );
      const win = getMainWindow();

      const updatedTracks = await scanner.scanFolders(
        uniqueFolders,
        currentLib.tracks,
        win,
        currentLib.removedTrackPaths || [],
      );
      const updatedLib = await store.setLibrary({
        folders: uniqueFolders,
        tracks: updatedTracks,
      });

      return updatedLib;
    },
  );

  // Cancel ongoing scan
  ipcMain.handle(IPC_CHANNELS.LIBRARY_CANCEL_SCAN, () => {
    scanner.cancel();
    return true;
  });

  // Remove folder from library
  ipcMain.handle(
    IPC_CHANNELS.LIBRARY_REMOVE_FOLDER,
    async (_event, folderToRemove: string) => {
      const currentLib = store.getLibrary();
      const updatedFolders = currentLib.folders.filter(
        (f) => f !== folderToRemove,
      );

      const updatedTracks = { ...currentLib.tracks };
      // Remove tracks that belong to this folder
      for (const [id, track] of Object.entries(updatedTracks)) {
        if (track.path.startsWith(folderToRemove)) {
          delete updatedTracks[id];
        }
      }

      const updatedLib = await store.setLibrary({
        folders: updatedFolders,
        tracks: updatedTracks,
      });
      return updatedLib;
    },
  );

  // Remove track from library
  ipcMain.handle(
    IPC_CHANNELS.LIBRARY_REMOVE_TRACK,
    async (_event, trackId: string) => {
      return await store.removeTrackFromLibrary(trackId);
    },
  );

  // Clear entire library
  ipcMain.handle(IPC_CHANNELS.LIBRARY_CLEAR, async () => {
    return await store.clearLibrary();
  });

  // Save/update playlist
  ipcMain.handle(
    IPC_CHANNELS.PLAYLIST_SAVE,
    async (_event, playlist: Playlist) => {
      const currentLib = store.getLibrary();
      const updatedPlaylists = {
        ...currentLib.playlists,
        [playlist.id]: playlist,
      };
      await store.setLibrary({ playlists: updatedPlaylists });
      return playlist;
    },
  );

  // Delete playlist
  ipcMain.handle(
    IPC_CHANNELS.PLAYLIST_DELETE,
    async (_event, playlistId: string) => {
      const currentLib = store.getLibrary();
      const updatedPlaylists = { ...currentLib.playlists };
      delete updatedPlaylists[playlistId];
      await store.setLibrary({ playlists: updatedPlaylists });
      return true;
    },
  );

  // Toggle favorite
  ipcMain.handle(
    IPC_CHANNELS.FAVORITE_TOGGLE,
    async (_event, trackId: string) => {
      return await store.toggleFavorite(trackId);
    },
  );

  // Record track play
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_RECORD_PLAY,
    async (_event, trackId: string) => {
      await store.recordPlay(trackId);
      return true;
    },
  );

  // Get user settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return store.getSettings();
  });

  // Save user settings
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SET,
    async (_event, settings: Partial<UserSettings>) => {
      return await store.setSettings(settings);
    },
  );

  // Show file in OS explorer
  ipcMain.handle(
    IPC_CHANNELS.SYSTEM_SHOW_ITEM_IN_FOLDER,
    async (_event, filePath: string) => {
      if (!filePath || typeof filePath !== 'string') return false;
      try {
        const normalized = path.normalize(filePath);
        if (fs.existsSync(normalized)) {
          shell.showItemInFolder(normalized);
          return true;
        }
        const parentDir = path.dirname(normalized);
        if (fs.existsSync(parentDir)) {
          await shell.openPath(parentDir);
          return true;
        }
      } catch (err) {
        console.error('Failed to show item in folder:', err);
      }
      return false;
    },
  );

  // Export music list
  ipcMain.handle(
    IPC_CHANNELS.EXPORT_MUSIC_LIST,
    (_event, request: ExportRequest) => {
      return handleExportMusicList(request, getMainWindow);
    },
  );

  // Window controls
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = getMainWindow();
    win?.minimize();
  });
  // Show Now Playing notification
  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_SHOW,
    (_event, data: { title: string; artist: string }) => {
      if (!Notification.isSupported()) {
        return false;
      }

      const title = data.title?.trim();

      if (!title) {
        return false;
      }

      const artist = data.artist?.trim();

      const notification = new Notification({
        title: "🎵 Sonora",
        body: artist ? `${title}\n${artist}` : title,
      });

      notification.show();

      return true;
    },
  );
  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      return win.isMaximized();
    }
    return false;
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const win = getMainWindow();
    win?.close();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    const win = getMainWindow();
    return win?.isMaximized() ?? false;
  });

  // Get pending files arriving before renderer is ready
  ipcMain.handle(IPC_CHANNELS.FILES_GET_PENDING, () => {
    return getPendingFiles ? getPendingFiles() : [];
  });

  // Resolve external file paths into Track objects
  ipcMain.handle(
    IPC_CHANNELS.TRACKS_RESOLVE_BY_PATHS,
    async (_event, filePaths: string[]) => {
      const result = await importAudioFiles(filePaths, store, scanner);
      return [...result.added, ...result.existing];
    },
  );

  // Import files with complete stats (for drag & drop and external files)
  ipcMain.handle(
    IPC_CHANNELS.FILES_IMPORT,
    async (_event, filePaths: string[]) => {
      return await importAudioFiles(filePaths, store, scanner);
    },
  );
}

async function importAudioFiles(
  filePaths: string[],
  store: AppStore,
  scanner: LibraryScanner,
): Promise<FileImportResult> {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return {
      added: [],
      existing: [],
      unsupportedCount: 0,
      failedCount: 0,
      totalDropped: 0,
    };
  }

  const totalDropped = filePaths.length;
  const validPaths: string[] = [];
  const seenPaths = new Set<string>();
  let unsupportedCount = 0;
  let failedCount = 0;

  for (const rawPath of filePaths) {
    if (!rawPath || typeof rawPath !== 'string') {
      unsupportedCount++;
      continue;
    }

    const trimmed = rawPath.trim();
    if (!trimmed) {
      unsupportedCount++;
      continue;
    }

    const ext = path.extname(trimmed).toLowerCase();
    if (!SUPPORTED_AUDIO_EXTENSIONS.has(ext)) {
      unsupportedCount++;
      continue;
    }

    try {
      const normalized = path.normalize(trimmed);
      const lowerKey = normalized.toLowerCase();
      if (seenPaths.has(lowerKey)) {
        continue;
      }
      seenPaths.add(lowerKey);

      if (fs.existsSync(normalized) && fs.statSync(normalized).isFile()) {
        validPaths.push(normalized);
        store.unmarkRemovedTrack(normalized);
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  const currentLib = store.getLibrary();
  const added: Track[] = [];
  const existing: Track[] = [];
  const newTracksMap: Record<string, Track> = {};

  // Process in bounded concurrent batches to maintain responsiveness
  const BATCH_SIZE = 8;
  for (let i = 0; i < validPaths.length; i += BATCH_SIZE) {
    const batch = validPaths.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (filePath) => {
        try {
          const trackId = crypto.createHash('sha1').update(filePath).digest('hex');
          const existingTrack = currentLib.tracks[trackId];
          const track = await scanner.parseTrack(filePath, existingTrack);
          return { track, isExisting: !!existingTrack, trackId };
        } catch (err) {
          console.error(`Failed to parse track ${filePath}:`, err);
          return { track: null, isExisting: false, trackId: '' };
        }
      }),
    );

    for (const res of results) {
      if (!res.track) {
        failedCount++;
        continue;
      }
      if (res.isExisting) {
        existing.push(res.track);
      } else {
        added.push(res.track);
        newTracksMap[res.trackId] = res.track;
      }
    }
  }

  const updatedRemovedPaths = store.getLibrary().removedTrackPaths;
  if (
    Object.keys(newTracksMap).length > 0 ||
    currentLib.removedTrackPaths?.length !== updatedRemovedPaths?.length
  ) {
    await store.setLibrary({
      tracks: {
        ...currentLib.tracks,
        ...newTracksMap,
      },
      removedTrackPaths: updatedRemovedPaths,
    });
  }

  return {
    added,
    existing,
    unsupportedCount,
    failedCount,
    totalDropped,
  };
}

const MEDIA_SHORTCUTS: ReadonlyArray<{ accelerator: string; command: MediaCommand }> = [
  { accelerator: "MediaPlayPause", command: "play-pause" },
  { accelerator: "MediaNextTrack", command: "next-track" },
  { accelerator: "MediaPreviousTrack", command: "previous-track" },
  { accelerator: "MediaStop", command: "stop" },
];

export function registerMediaShortcuts(
  getMainWindow: () => BrowserWindow | null,
): void {
  unregisterMediaShortcuts();

  for (const { accelerator, command } of MEDIA_SHORTCUTS) {
    try {
      globalShortcut.register(accelerator, () => {
        const win = getMainWindow();
        if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.MEDIA_COMMAND, command);
        }
      });
    } catch (err) {
      console.error(`Failed to register global shortcut ${accelerator}:`, err);
    }
  }
}

export function unregisterMediaShortcuts(): void {
  for (const { accelerator } of MEDIA_SHORTCUTS) {
    if (globalShortcut.isRegistered(accelerator)) {
      globalShortcut.unregister(accelerator);
    }
  }
}

