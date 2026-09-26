import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerMediaSchemePrivilege, setupMediaProtocol } from './protocol';
import { AppStore } from './store';
import { LibraryScanner } from './scanner';
import { registerIpcHandlers, registerMediaShortcuts, unregisterMediaShortcuts } from './ipc';
import { createAppTray, destroyAppTray, getAppIcon } from './tray';
import { IPC_CHANNELS } from '../shared/channels';
import { parseFileArgs, SUPPORTED_AUDIO_EXTENSIONS } from './fileArgs';

export { parseFileArgs, SUPPORTED_AUDIO_EXTENSIONS };

// Set stable Windows AppUserModelId
app.setAppUserModelId('com.sonora.player');

// Disable Chromium's internal media key handling so Electron globalShortcut handles media keys
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

// Register custom media scheme privilege before app is ready
registerMediaSchemePrivilege();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;
let store: AppStore | null = null;
let scanner: LibraryScanner | null = null;
let isQuitting = false;
let isRendererReady = false;
const pendingFiles: string[] = [];

// Parse any files passed on initial launch
const initialFiles = parseFileArgs(process.argv);
if (initialFiles.length > 0) {
  pendingFiles.push(...initialFiles);
}

function handleExternalFiles(files: string[]): void {
  if (!files || files.length === 0) return;

  if (mainWindow && !mainWindow.isDestroyed() && isRendererReady) {
    mainWindow.webContents.send(IPC_CHANNELS.FILES_OPEN, files);
  } else {
    for (const f of files) {
      if (!pendingFiles.includes(f)) {
        pendingFiles.push(f);
      }
    }
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine, workingDirectory) => {
    showMainWindow();
    const files = parseFileArgs(commandLine, workingDirectory);
    if (files.length > 0) {
      handleExternalFiles(files);
    }
  });

  app.on('before-quit', () => {
    isQuitting = true;
    unregisterMediaShortcuts();
    destroyAppTray();
  });

  app.on('will-quit', () => {
    unregisterMediaShortcuts();
    destroyAppTray();
  });

  app.whenReady().then(async () => {
    setupMediaProtocol();

    store = new AppStore();
    scanner = new LibraryScanner();

    createMainWindow();

    createAppTray({
      onShow: () => {
        showMainWindow();
      },
      onQuit: () => {
        isQuitting = true;
        app.quit();
      },
    });

    registerIpcHandlers(
      store,
      scanner,
      () => mainWindow,
      () => {
        isRendererReady = true;
        const files = [...pendingFiles];
        pendingFiles.length = 0;
        return files;
      },
    );
    registerMediaShortcuts(() => mainWindow);

    app.on('activate', () => {
      showMainWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (isQuitting) {
      app.quit();
    }
  });
}

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }

  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
}

function createMainWindow(): void {
  const preloadPath = path.join(__dirname, '../preload/index.js');
  const appIcon = getAppIcon();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: store?.getSettings()?.themeMode === 'light' ? '#f4f5f8' : '#0b0d14',
    icon: appIcon,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      backgroundThrottling: false,
    },
  });

  // Intercept window close button to hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    isRendererReady = false;
  });

  // Smooth window appearance once content is painted
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

