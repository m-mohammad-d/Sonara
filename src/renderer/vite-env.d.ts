/// <reference types="vite/client" />

import type { SonoraAPI } from '../preload';

declare global {
  interface Window {
    electronAPI: SonoraAPI;
    sonora: {
      files: {
        onOpen: (callback: (filePaths: string[]) => void) => () => void;
      };
    };
  }
}
