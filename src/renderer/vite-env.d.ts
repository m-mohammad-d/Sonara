/// <reference types="vite/client" />

import type { SonoraAPI } from '../preload';
import type { FileImportResult } from '../shared/types';

declare global {
  interface Window {
    electronAPI: SonoraAPI;
    sonora: {
      files: {
        onOpen: (callback: (filePaths: string[]) => void) => () => void;
        getPathForFile: (file: File) => string;
        import: (filePaths: string[]) => Promise<FileImportResult>;
      };
    };
  }
}
