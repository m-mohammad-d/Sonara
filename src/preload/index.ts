import { contextBridge, ipcRenderer, webUtils } from "electron";
import { IPC_CHANNELS } from "../shared/channels";
import type {
  Track,
  LibraryData,
  Playlist,
  ScanProgress,
  UserSettings,
  MediaCommand,
  FileImportResult,
} from "../shared/types";
import type { ExportRequest, ExportResult } from "../shared/export/types";

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
  exportMusicList: (request: ExportRequest) => Promise<ExportResult>;
  onOpenFiles: (callback: (filePaths: string[]) => void) => () => void;
  getPendingFiles: () => Promise<string[]>;
  resolveTracks: (filePaths: string[]) => Promise<Track[]>;
  getPathForFile: (file: File) => string;
  importFiles: (filePaths: string[]) => Promise<FileImportResult>;
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

  exportMusicList: (request: ExportRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXPORT_MUSIC_LIST, request),

  onOpenFiles: (callback: (filePaths: string[]) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      filePaths: string[],
    ) => {
      callback(filePaths);
    };
    ipcRenderer.on(IPC_CHANNELS.FILES_OPEN, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.FILES_OPEN, subscription);
    };
  },

  getPendingFiles: () => ipcRenderer.invoke(IPC_CHANNELS.FILES_GET_PENDING),

  resolveTracks: (filePaths: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.TRACKS_RESOLVE_BY_PATHS, filePaths),

  getPathForFile: (file: File) => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === "function") {
        return webUtils.getPathForFile(file);
      }
    } catch {
      // Fallback
    }
    return (file as unknown as { path?: string }).path || "";
  },

  importFiles: (filePaths: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILES_IMPORT, filePaths),
};

contextBridge.exposeInMainWorld("electronAPI", api);

contextBridge.exposeInMainWorld("sonora", {
  files: {
    onOpen: (callback: (filePaths: string[]) => void) => api.onOpenFiles(callback),
    getPathForFile: (file: File) => api.getPathForFile(file),
    import: (filePaths: string[]) => api.importFiles(filePaths),
  },
});

