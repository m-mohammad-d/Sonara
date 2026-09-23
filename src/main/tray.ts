import { Tray, Menu, nativeImage, type NativeImage, app } from "electron";
import fs from "node:fs";
import path from "node:path";

let tray: Tray | null = null;

export function getAppIcon(): NativeImage {
  const possiblePaths = app.isPackaged
    ? [path.join(process.resourcesPath, "icon.png")]
    : [
        path.join(app.getAppPath(), "public", "icon.png"),
        path.join(process.cwd(), "public", "icon.png"),
      ];

  for (const filePath of possiblePaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const image = nativeImage.createFromPath(filePath);

    if (!image.isEmpty()) {
      return image;
    }
  }
  throw new Error(
    `Sonora icon could not be found.\nSearched:\n${possiblePaths.join("\n")}`,
  );
}

export interface TrayCallbacks {
  onShow: () => void;
  onQuit: () => void;
}

export function createAppTray(callbacks: TrayCallbacks): Tray {
  if (tray && !tray.isDestroyed()) {
    return tray;
  }

  tray = new Tray(getAppIcon());

  tray.setToolTip("Sonora Music Player");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Sonora",
      click: callbacks.onShow,
    },
    {
      type: "separator",
    },
    {
      label: "Quit Sonora",
      click: callbacks.onQuit,
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", callbacks.onShow);

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
