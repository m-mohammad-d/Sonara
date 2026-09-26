import fs from 'node:fs';
import path from 'node:path';

export const SUPPORTED_AUDIO_EXTENSIONS = new Set<string>([
  '.mp3',
  '.flac',
  '.wav',
  '.ogg',
  '.m4a',
  '.aac',
  '.opus',
  '.wma',
]);

/**
 * Extracts and validates audio file paths from command-line arguments.
 * Handles quoted paths, paths with spaces/Unicode, relative paths, and ignores Electron/Chromium flags.
 */
export function parseFileArgs(argv: string[], workingDirectory?: string): string[] {
  if (!Array.isArray(argv) || argv.length === 0) {
    return [];
  }

  const validPaths: string[] = [];
  const seenPaths = new Set<string>();

  for (const rawArg of argv) {
    if (typeof rawArg !== 'string') continue;

    // Strip surrounding quotes and whitespace
    const arg = rawArg.trim().replace(/^["']|["']$/g, '');
    if (!arg) continue;

    // Ignore Electron, Chromium, and Windows command switches
    if (arg.startsWith('--') || arg.startsWith('-') || (/^\/[a-zA-Z0-9]+(:.*)?$/.test(arg))) {
      continue;
    }

    // Fast check: must have a supported audio extension
    const ext = path.extname(arg).toLowerCase();
    if (!SUPPORTED_AUDIO_EXTENSIONS.has(ext)) {
      continue;
    }

    try {
      // Resolve absolute path using workingDirectory if relative
      const resolved = path.isAbsolute(arg)
        ? path.normalize(arg)
        : path.normalize(path.resolve(workingDirectory || process.cwd(), arg));

      // Key for case-insensitive deduplication on Windows
      const lowerKey = resolved.toLowerCase();
      if (seenPaths.has(lowerKey)) {
        continue;
      }

      // Verify path exists and is a file
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        seenPaths.add(lowerKey);
        validPaths.push(resolved);
      }
    } catch {
      // Gracefully ignore inaccessible or unreadable paths
    }
  }

  return validPaths;
}
