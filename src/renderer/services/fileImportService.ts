import { SUPPORTED_AUDIO_EXTENSIONS } from '../../shared/types';
import type { FileImportResult } from '../../shared/types';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Extracts the file path from a dropped File object using Electron's webUtils bridge,
 * with graceful fallback to file.path if available.
 */
export function getFilePath(file: File): string {
  try {
    if (window.sonora?.files?.getPathForFile) {
      const p = window.sonora.files.getPathForFile(file);
      if (p) return p;
    }
    if (window.electronAPI?.getPathForFile) {
      const p = window.electronAPI.getPathForFile(file);
      if (p) return p;
    }
  } catch {
    // Continue to fallback
  }

  return (file as unknown as { path?: string }).path || '';
}

/**
 * Validates whether a file path or file name has a supported audio extension (case-insensitive).
 */
export function isAudioExtension(filePathOrName: string): boolean {
  if (!filePathOrName) return false;
  const dotIndex = filePathOrName.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = filePathOrName.slice(dotIndex).toLowerCase();
  return (SUPPORTED_AUDIO_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Processes dropped files, validates audio formats, sends them to the import pipeline,
 * updates the library store, and presents a single consolidated notification.
 */
export async function processDroppedFiles(files: FileList | File[]): Promise<FileImportResult> {
  const fileArray = Array.from(files);
  const totalDropped = fileArray.length;

  if (totalDropped === 0) {
    return {
      added: [],
      existing: [],
      unsupportedCount: 0,
      failedCount: 0,
      totalDropped: 0,
    };
  }

  const validPaths: string[] = [];
  const seenPaths = new Set<string>();
  let localUnsupportedCount = 0;

  for (const file of fileArray) {
    const filePath = getFilePath(file);

    if (!filePath) {
      // If native path cannot be resolved or is not a local file
      localUnsupportedCount++;
      continue;
    }

    if (!isAudioExtension(filePath)) {
      localUnsupportedCount++;
      continue;
    }

    const lowerKey = filePath.toLowerCase();
    if (seenPaths.has(lowerKey)) {
      continue; // Duplicate within the same drop operation
    }
    seenPaths.add(lowerKey);
    validPaths.push(filePath);
  }

  // Handle case where all dropped files were unsupported
  if (validPaths.length === 0) {
    useUIStore.getState().showToast(
      'Unsupported Files',
      'No supported audio files found. Sonora supports MP3, FLAC, WAV, M4A, AAC, OGG, OPUS, and WMA.',
    );
    return {
      added: [],
      existing: [],
      unsupportedCount: localUnsupportedCount,
      failedCount: 0,
      totalDropped,
    };
  }

  // Show a progress indication if importing a large batch
  if (validPaths.length > 20) {
    useUIStore.getState().showToast(
      'Importing Music',
      `Processing ${validPaths.length} audio file${validPaths.length === 1 ? '' : 's'}...`,
    );
  }

  try {
    const importFn = window.sonora?.files?.import || window.electronAPI?.importFiles;
    if (!importFn) {
      throw new Error('Import API is not available');
    }

    const result = await importFn(validPaths);
    const combinedUnsupported = result.unsupportedCount + localUnsupportedCount;

    // Update library store if new tracks were added
    if (result.added && result.added.length > 0) {
      useLibraryStore.getState().addExternalTracks(result.added);
    }

    // Consolidated user feedback
    displayImportFeedback({
      ...result,
      unsupportedCount: combinedUnsupported,
      totalDropped,
    });

    return {
      ...result,
      unsupportedCount: combinedUnsupported,
      totalDropped,
    };
  } catch (err) {
    console.error('Failed to import dropped audio files:', err);
    useUIStore.getState().showToast(
      'Import Error',
      'An unexpected error occurred while importing audio files.',
    );
    return {
      added: [],
      existing: [],
      unsupportedCount: localUnsupportedCount,
      failedCount: validPaths.length,
      totalDropped,
    };
  }
}

function displayImportFeedback(result: FileImportResult): void {
  const { added, existing, unsupportedCount, failedCount } = result;

  if (added.length > 0) {
    let message = `Added ${added.length} track${added.length === 1 ? '' : 's'}`;

    if (unsupportedCount > 0) {
      message += ` · ${unsupportedCount} unsupported file${unsupportedCount === 1 ? '' : 's'} skipped`;
    }
    if (existing.length > 0) {
      message += ` (${existing.length} already in library)`;
    }
    if (failedCount > 0) {
      message += ` · ${failedCount} unreadable`;
    }

    useUIStore.getState().showToast('Files Imported', message, {
      label: 'Play',
      onClick: () => {
        const first = added[0];
        if (first) {
          usePlayerStore.getState().playTrack(first, added);
        }
      },
    });
    return;
  }

  if (existing.length > 0) {
    let message = `All ${existing.length} track${existing.length === 1 ? '' : 's'} already exist in your library.`;
    if (unsupportedCount > 0) {
      message += ` (${unsupportedCount} unsupported file${unsupportedCount === 1 ? '' : 's'} skipped)`;
    }

    useUIStore.getState().showToast('Already in Library', message, {
      label: 'Play',
      onClick: () => {
        const first = existing[0];
        if (first) {
          usePlayerStore.getState().playTrack(first, existing);
        }
      },
    });
    return;
  }

  if (unsupportedCount > 0) {
    useUIStore.getState().showToast(
      'Unsupported Files',
      'No supported audio files found. Sonora supports MP3, FLAC, WAV, M4A, AAC, OGG, OPUS, and WMA.',
    );
    return;
  }

  if (failedCount > 0) {
    useUIStore.getState().showToast(
      'Import Failed',
      'Could not read audio metadata from the dropped files.',
    );
  }
}
