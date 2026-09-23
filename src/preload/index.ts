import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/channels";
import type {
  LibraryData,
  Playlist,
  ScanProgress,
  UserSettings,
  MediaCommand,
} from "../shared/types";

export interface SonoraAPI {
  selectFolders: () => Promise<string[]>;
  getLibrary: () => Promise<LibraryData>;
  scanLibrary: (folders?: string[]) => Promise<LibraryData>;
  cancelScan: () => Promise<boolean>;
  removeFolder: (folder: string) => Promise<LibraryData>;
  onScanProgress: (callback: (progress: ScanProgress) => void) => () => void;
  onMediaCommand: (callback: (command: MediaCommand) => void) => () => void;
  savePlaylist: (playlist: Playlist) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;
  toggleFavorite: (trackId: string) => Promise<string[]>;
  recordPlay: (trackId: string) => Promise<boolean>;
  getSettings: () => Promise<UserSettings>;
  saveSettings: (settings: Partial<UserSettings>) => Promise<UserSettings>;
  showItemInFolder: (path: string) => Promise<boolean>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<boolean>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;
  showNotification: (title: string, artist: string) => Promise<boolean>;
}

const api: SonoraAPI = {
  selectFolders: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FOLDERS),
  getLibrary: () => ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_GET_ALL),
  scanLibrary: (folders?: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_SCAN, folders),
  cancelScan: () => ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_CANCEL_SCAN),
  removeFolder: (folder: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_REMOVE_FOLDER, folder),
  onScanProgress: (callback: (progress: ScanProgress) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      progress: ScanProgress,
    ) => {
      callback(progress);
    };
    ipcRenderer.on(IPC_CHANNELS.LIBRARY_SCAN_PROGRESS, subscription);
    return () => {
      ipcRenderer.removeListener(
        IPC_CHANNELS.LIBRARY_SCAN_PROGRESS,
        subscription,
      );
    };
  },
  onMediaCommand: (callback: (command: MediaCommand) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      command: MediaCommand,
    ) => {
      callback(command);
    };
    ipcRenderer.on(IPC_CHANNELS.MEDIA_COMMAND, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.MEDIA_COMMAND, subscription);
    };
  },
  savePlaylist: (playlist: Playlist) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLAYLIST_SAVE, playlist),
  deletePlaylist: (playlistId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLAYLIST_DELETE, playlistId),
  toggleFavorite: (trackId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FAVORITE_TOGGLE, trackId),
  recordPlay: (trackId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.HISTORY_RECORD_PLAY, trackId),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: (settings: Partial<UserSettings>) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  showItemInFolder: (path: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_SHOW_ITEM_IN_FOLDER, path),
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  showNotification: (title: string, artist: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, { title, artist }),

  isWindowMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
};

contextBridge.exposeInMainWorld("electronAPI", api);
