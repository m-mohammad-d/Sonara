import { app, dialog, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { ExportFormat, ExportRequest, ExportResult } from '../../shared/export/types';
import {
  exportToCsv,
  exportToTsv,
  exportToJson,
  exportToM3u8,
  exportToTxt,
  exportToMarkdown,
  exportToHtml,
} from '../../shared/export';
import { generatePdf } from './pdfExporter';

export function sanitizeFileName(name: string): string {
  // Remove Windows invalid filename characters: \ / : * ? " < > | and control characters
  const sanitized = name
    .replace(/[\\/:*?"<>|\x00-\x1F\x7F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .trim();

  return sanitized.slice(0, 100) || 'Sonora-Export';
}

function getDefaultFileName(collectionName: string, source: string, format: ExportFormat): string {
  const safeName = sanitizeFileName(collectionName);
  let basePrefix = 'Sonora';

  switch (source) {
    case 'library':
      basePrefix = collectionName === 'Library' || collectionName === 'Music Library'
        ? 'Sonora-Music-Library'
        : `Sonora-Library-${safeName}`;
      break;
    case 'playlist':
      basePrefix = `Sonora-Playlist-${safeName}`;
      break;
    case 'queue':
      basePrefix = 'Sonora-Queue';
      break;
    case 'favorites':
      basePrefix = 'Sonora-Favorites';
      break;
    case 'recently-played':
      basePrefix = 'Sonora-Recently-Played';
      break;
    case 'album':
      basePrefix = `Sonora-Album-${safeName}`;
      break;
    case 'artist':
      basePrefix = `Sonora-Artist-${safeName}`;
      break;
    case 'genre':
      basePrefix = `Sonora-Genre-${safeName}`;
      break;
    default:
      basePrefix = `Sonora-${safeName}`;
  }

  const ext = format === 'md' ? 'md' : format;

  // Prevent duplicate extensions like .csv.csv
  if (basePrefix.toLowerCase().endsWith(`.${ext}`)) {
    return basePrefix;
  }

  return `${basePrefix}.${ext}`;
}

function getDialogFilters(format: ExportFormat) {
  switch (format) {
    case 'html':
      return [{ name: 'HTML Document', extensions: ['html', 'htm'] }];
    case 'pdf':
      return [{ name: 'PDF Document', extensions: ['pdf'] }];
    case 'csv':
      return [{ name: 'CSV Spreadsheet', extensions: ['csv'] }];
    case 'tsv':
      return [{ name: 'TSV Spreadsheet', extensions: ['tsv'] }];
    case 'json':
      return [{ name: 'JSON Document', extensions: ['json'] }];
    case 'm3u8':
      return [{ name: 'M3U8 Playlist', extensions: ['m3u8', 'm3u'] }];
    case 'txt':
      return [{ name: 'Text Document', extensions: ['txt'] }];
    case 'md':
      return [{ name: 'Markdown Document', extensions: ['md', 'markdown'] }];
  }
}

async function loadArtworkDataUrl(artworkId?: string): Promise<string | undefined> {
  if (!artworkId) return undefined;

  try {
    const artworkCacheDir = path.join(app.getPath('userData'), 'artwork-cache');
    const artworkPath = path.join(artworkCacheDir, artworkId);

    const stat = await fs.promises.stat(artworkPath);
    // Only embed if file is reasonably sized (<= 2MB)
    if (stat.size > 2 * 1024 * 1024) {
      return undefined;
    }

    const data = await fs.promises.readFile(artworkPath);
    const base64 = data.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return undefined;
  }
}

export async function handleExportMusicList(
  request: ExportRequest,
  getMainWindow: () => BrowserWindow | null
): Promise<ExportResult> {
  const { collection, format } = request;

  if (!collection || !collection.tracks || collection.tracks.length === 0) {
    return { success: false, error: 'No tracks to export.' };
  }

  const win = getMainWindow();
  const defaultFileName = getDefaultFileName(collection.name, collection.source, format);

  const dialogResult = await dialog.showSaveDialog(win || undefined as unknown as BrowserWindow, {
    title: `Export ${collection.name} as ${format.toUpperCase()}`,
    defaultPath: defaultFileName,
    filters: getDialogFilters(format),
  });

  if (dialogResult.canceled || !dialogResult.filePath) {
    return { success: false, canceled: true };
  }

  const destinationPath = dialogResult.filePath;

  try {
    switch (format) {
      case 'csv': {
        const content = exportToCsv(collection);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'tsv': {
        const content = exportToTsv(collection);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'json': {
        const content = exportToJson(collection);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'm3u8': {
        const content = exportToM3u8(collection);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'txt': {
        const content = exportToTxt(collection);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'md': {
        const content = exportToMarkdown(collection);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'html': {
        const artworkDataUrl = await loadArtworkDataUrl(collection.artworkId);
        const content = exportToHtml(collection, artworkDataUrl);
        await fs.promises.writeFile(destinationPath, content, 'utf-8');
        break;
      }
      case 'pdf': {
        const artworkDataUrl = await loadArtworkDataUrl(collection.artworkId);
        const html = exportToHtml(collection, artworkDataUrl);
        const pdfBuffer = await generatePdf(html, collection.name);
        await fs.promises.writeFile(destinationPath, pdfBuffer);
        break;
      }
      default:
        return { success: false, error: `Unsupported export format: ${format}` };
    }

    return { success: true, filePath: destinationPath };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to write export file.';
    console.error('Export error:', err);
    return { success: false, error: errorMsg };
  }
}
