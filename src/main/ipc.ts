import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';
import type { AppStore } from './store';
import type { LibraryScanner } from './scanner';
import type { Playlist, UserSettings } from '../shared/types';

export function registerIpcHandlers(
  store: AppStore,
  scanner: LibraryScanner,
  getMainWindow: () => BrowserWindow | null
): void {
  // Select folder dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FOLDERS, async () => {
    const win = getMainWindow();
    if (!win) return [];
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'multiSelections'],
      title: 'Select Music Folders',
    });
    if (result.canceled) return [];
    return result.filePaths;
  });

  // Get entire library
  ipcMain.handle(IPC_CHANNELS.LIBRARY_GET_ALL, () => {
    return store.getLibrary();
  });

  // Scan library
  ipcMain.handle(IPC_CHANNELS.LIBRARY_SCAN, async (_event, targetFolders?: string[]) => {
    const currentLib = store.getLibrary();
    const foldersToScan = targetFolders && targetFolders.length > 0 ? targetFolders : currentLib.folders;

    // Merge folders into store
    const uniqueFolders = Array.from(new Set([...currentLib.folders, ...foldersToScan]));
    const win = getMainWindow();

    const updatedTracks = await scanner.scanFolders(uniqueFolders, currentLib.tracks, win);
    const updatedLib = await store.setLibrary({
      folders: uniqueFolders,
      tracks: updatedTracks,
    });

    return updatedLib;
  });

  // Cancel ongoing scan
  ipcMain.handle(IPC_CHANNELS.LIBRARY_CANCEL_SCAN, () => {
    scanner.cancel();
    return true;
  });

  // Remove folder from library
  ipcMain.handle(IPC_CHANNELS.LIBRARY_REMOVE_FOLDER, async (_event, folderToRemove: string) => {
    const currentLib = store.getLibrary();
    const updatedFolders = currentLib.folders.filter((f) => f !== folderToRemove);

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
  });

  // Save/update playlist
  ipcMain.handle(IPC_CHANNELS.PLAYLIST_SAVE, async (_event, playlist: Playlist) => {
    const currentLib = store.getLibrary();
    const updatedPlaylists = {
      ...currentLib.playlists,
      [playlist.id]: playlist,
    };
    await store.setLibrary({ playlists: updatedPlaylists });
    return playlist;
  });

  // Delete playlist
  ipcMain.handle(IPC_CHANNELS.PLAYLIST_DELETE, async (_event, playlistId: string) => {
    const currentLib = store.getLibrary();
    const updatedPlaylists = { ...currentLib.playlists };
    delete updatedPlaylists[playlistId];
    await store.setLibrary({ playlists: updatedPlaylists });
    return true;
  });

  // Toggle favorite
  ipcMain.handle(IPC_CHANNELS.FAVORITE_TOGGLE, async (_event, trackId: string) => {
    return await store.toggleFavorite(trackId);
  });

  // Record track play
  ipcMain.handle(IPC_CHANNELS.HISTORY_RECORD_PLAY, async (_event, trackId: string) => {
    await store.recordPlay(trackId);
    return true;
  });

  // Get user settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return store.getSettings();
  });

  // Save user settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, settings: Partial<UserSettings>) => {
    return await store.setSettings(settings);
  });

  // Show file in OS explorer
  ipcMain.handle(IPC_CHANNELS.SYSTEM_SHOW_ITEM_IN_FOLDER, (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
    return true;
  });

  // Window controls
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = getMainWindow();
    win?.minimize();
  });

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
}
