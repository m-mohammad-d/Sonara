import { Tray, Menu, nativeImage, type NativeImage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SONORA_ICON_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD10lEQVR42s3XW28TRxQHcD6CP4I/Qj5CXn2L715vgAC5kwAJjkPAgeRAQgpJEYgiJFqBq6pKE6GKh4JopdJW6kPVSn1KKkHLRSCBr3tfOxBHnHYW1+v17s5uqrZipHnJQ+bn2TNn/rNnz/s6MnHBk4kL3VNxAbIJEaYTIpxIiDCTFOFkUoJTSQlyKQlmUxKcTslwhpFhjpFhnpEB0oo2z6YVOMeq3Qus6nG98ESM907G+PzxmICZuIBTcQGzcQGnE6I2TyREnEmKeDIp4amkhLmUhLMpCU8zMp5hZJxjZJxPKwhpBc+mFTzHKrjAqmTmF1nVS138aJTvOhblhYkYj5MxHv9txCKrCous2mW5+HiE8x6JcsLRKI/Hojw6IS6MyXgDVPwYarg8ruwWYd6JsQiXH49weCTKIQ2Rv6jiy2c72DlePdvBz1dqrj+HYfHRcNVzOFLFsQiHNMQv379Bp/HrD9tuEZ52QPdouIo0xP31LXQ7Htx+7Yggp6MFGAlXYSRcRTsEjIiWCz3ebGjTaqyMK1QEOaItwHBPBYbDVbRDfHmzZvjndfUtfjgltwrzclbR/tY+7n66RS1MaAcMEUBPBe0Qv28Yf+WdWzXT6Vi7ZkQ++W3H6YjqgMGeCgwRgA2iE0B+7UpGMiCuzykdgAa9T/zVMVuAgVAFBnsqaIe4u1Y3feNOhAmw2XBqVjqgP1SGgVAFaYifHry2RNy8oGiIXJ9oqIP1a3WnjqkDDoXK0B8q4z9BkLH6kaohFkYl/GZ9S9sNx7adagMcDJbhUKiMbhCfXVWpiF3cHTrgQLAMB4Nl/J8ROqAvWIIDwTLSEJdmJfzqizrODvFUxM/fvXGL0AH7AyXoC5bQDnHrimIovEwvpyFufGBuQLtA6IB9gRLsD5TQDvFwY9uwANmNvz/H0nHREvH1+pYTQgfsDZRgX6CEdggrQHtNWCH+2Gw4hRod0Osvwl5/Ee0QnYD8FcVUmLc77gsCcAg1RkCvv4h2iNVPjF2upr7FhQmhhTg/ad4BcoHRklW2HcD6i8D6i2iHyPZzlhX/aGNbm1ZjfkSgJiuStluAtK/YnfYVkYa4s1pzHUjurdXRKd6RyN8CML6Ch/EV0Anx47fOqYi0azfxjrw7DLmQ8RXybhBXFyV8/sScgl48beD1JRlpyaoNkTel4pSv4GV8BcENghTm9ACHF3MCLudEnBnkkZYnOhDk3WH9QEn5Cl27Qbi9O9oQ5N3RRX0dNXci/x8gyLvD6/qNSAqTnA72XY/QZrNjQvPugOYtCs08Ac1kBc2MSZI2NCO/5719hf8J+v+kjWMDV48AAAAASUVORK5CYII=';

let tray: Tray | null = null;

export function getAppIcon(): NativeImage {
  const possiblePaths = [
    path.join(__dirname, '../../resources/icon.ico'),
    path.join(__dirname, '../../public/icon.ico'),
    path.join(__dirname, '../../dist/icon.ico'),
    path.join(__dirname, '../../resources/icon.png'),
    path.join(__dirname, '../../public/icon.png'),
    path.join(__dirname, '../../dist/icon.png'),
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(process.resourcesPath, 'icon.png'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) {
        return img;
      }
    }
  }

  return nativeImage.createFromDataURL(`data:image/png;base64,${SONORA_ICON_BASE64}`);
}

export interface TrayCallbacks {
  onShow: () => void;
  onQuit: () => void;
}


export function createAppTray(callbacks: TrayCallbacks): Tray {
  if (tray && !tray.isDestroyed()) {
    return tray;
  }

  const icon = getAppIcon();
  tray = new Tray(icon);
  tray.setToolTip('Sonora Music Player');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Sonora',
      click: () => {
        callbacks.onShow();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit Sonora',
      click: () => {
        callbacks.onQuit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Restore and focus on single click
  tray.on('click', () => {
    callbacks.onShow();
  });

  // Restore and focus on double click
  tray.on('double-click', () => {
    callbacks.onShow();
  });

  return tray;
}

export function destroyAppTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
  tray = null;
}


export function getAppTray(): Tray | null {
  return tray;
}
