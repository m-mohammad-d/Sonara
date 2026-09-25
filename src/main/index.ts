import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerMediaSchemePrivilege, setupMediaProtocol } from './protocol';
import { AppStore } from './store';
import { LibraryScanner } from './scanner';
import { registerIpcHandlers, registerMediaShortcuts, unregisterMediaShortcuts } from './ipc';
import { createAppTray, destroyAppTray, getAppIcon } from './tray';

// Disable Chromium's internal media key handling so Electron globalShortcut handles media keys
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

// Register custom media scheme privilege before app is ready
registerMediaSchemePrivilege();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;
let store: AppStore | null = null;
let scanner: LibraryScanner | null = null;
let isQuitting = false;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
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

    registerIpcHandlers(store, scanner, () => mainWindow);
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

