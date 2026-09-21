import { app, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as musicMetadata from 'music-metadata';
import type { Track, ScanProgress } from '../shared/types';
import { IPC_CHANNELS } from '../shared/channels';

const SUPPORTED_EXTENSIONS = new Set([
  '.mp3',
  '.flac',
  '.wav',
  '.ogg',
  '.m4a',
  '.aac',
  '.opus',
  '.wma',
]);

export class LibraryScanner {
  private isCancelled = false;
  private isScanning = false;
  private artworkCacheDir: string;

  constructor() {
    this.artworkCacheDir = path.join(app.getPath('userData'), 'artwork-cache');
    if (!fs.existsSync(this.artworkCacheDir)) {
      fs.mkdirSync(this.artworkCacheDir, { recursive: true });
    }
  }

  public cancel(): void {
    if (this.isScanning) {
      this.isCancelled = true;
    }
  }

  public getScanningState(): boolean {
    return this.isScanning;
  }

  private emitProgress(window: BrowserWindow | null, progress: ScanProgress): void {
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.LIBRARY_SCAN_PROGRESS, progress);
    }
  }

  private async collectAudioFiles(dir: string, fileList: string[] = []): Promise<string[]> {
    if (this.isCancelled) return fileList;
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (this.isCancelled) break;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip hidden folders or system directories
          if (!entry.name.startsWith('.')) {
            await this.collectAudioFiles(fullPath, fileList);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            fileList.push(fullPath);
          }
        }
      }
    } catch {
      // Permission denied or folder unreadable
    }
    return fileList;
  }

  private async saveArtwork(picture: musicMetadata.IPicture): Promise<string | undefined> {
    try {
      const hash = crypto.createHash('md5').update(picture.data).digest('hex');
      const ext = picture.format?.includes('png') ? '.png' : '.jpg';
      const filename = `${hash}${ext}`;
      const filePath = path.join(this.artworkCacheDir, filename);

      if (!fs.existsSync(filePath)) {
        await fs.promises.writeFile(filePath, picture.data);
      }
      return filename;
    } catch {
      return undefined;
    }
  }

  public async scanFolders(
    folders: string[],
    existingTracks: Record<string, Track>,
    window: BrowserWindow | null
  ): Promise<Record<string, Track>> {
    if (this.isScanning) {
      return existingTracks;
    }

    this.isScanning = true;
    this.isCancelled = false;

    const updatedTracks: Record<string, Track> = { ...existingTracks };
    const albumsSet = new Set<string>();
    const artistsSet = new Set<string>();

    // Seed existing albums and artists
    for (const track of Object.values(existingTracks)) {
      if (track.album) albumsSet.add(track.album.toLowerCase());
      if (track.artist) artistsSet.add(track.artist.toLowerCase());
    }

    try {
      // Step 1: Collect all audio files across target folders
      const allFiles: string[] = [];
      for (const folder of folders) {
        if (this.isCancelled) break;
        if (fs.existsSync(folder)) {
          await this.collectAudioFiles(folder, allFiles);
        }
      }

      const totalFiles = allFiles.length;
      let processed = 0;
      let lastProgressUpdate = 0;

      this.emitProgress(window, {
        isScanning: true,
        current: 0,
        total: totalFiles,
        currentFile: 'Starting scan...',
        tracksFound: Object.keys(updatedTracks).length,
        albumsFound: albumsSet.size,
        artistsFound: artistsSet.size,
      });

      // Step 2: Process files in batches to prevent UI starvation
      for (const filePath of allFiles) {
        if (this.isCancelled) break;
        processed++;

        const trackId = crypto.createHash('sha1').update(filePath).digest('hex');
        const fileStat = await fs.promises.stat(filePath).catch(() => null);

        if (!fileStat) continue;

        // Skip re-parsing if track already exists and hasn't changed
        const existing = updatedTracks[trackId];
        if (existing && existing.fileSize === fileStat.size) {
          continue;
        }

        try {
          const metadata = await musicMetadata.parseFile(filePath, {
            skipCovers: false,
            duration: true,
          });

          const { common, format } = metadata;
          const fileNameNoExt = path.basename(filePath, path.extname(filePath));

          let artworkId = existing?.artworkId;
          if (!artworkId && common.picture && common.picture.length > 0) {
            artworkId = await this.saveArtwork(common.picture[0]);
          }

          const title = common.title?.trim() || fileNameNoExt;
          const artist = common.artist?.trim() || common.albumartist?.trim() || 'Unknown Artist';
          const album = common.album?.trim() || 'Unknown Album';
          const genre = common.genre && common.genre.length > 0 ? common.genre[0] : undefined;
          const year = common.year;
          const duration = format.duration && !isNaN(format.duration) ? Math.round(format.duration) : 0;
          const bitrate = format.bitrate ? Math.round(format.bitrate / 1000) : undefined;
          const sampleRate = format.sampleRate;
          const fileFormat = path.extname(filePath).replace('.', '').toUpperCase();

          albumsSet.add(album.toLowerCase());
          artistsSet.add(artist.toLowerCase());

          updatedTracks[trackId] = {
            id: trackId,
            path: filePath,
            title,
            artist,
            album,
            albumArtist: common.albumartist?.trim(),
            genre,
            year,
            trackNo: common.track?.no ?? undefined,
            trackOf: common.track?.of ?? undefined,
            discNo: common.disk?.no ?? undefined,
            duration,
            bitrate,
            sampleRate,
            format: fileFormat,
            artworkId,
            artworkUrl: artworkId ? `sonora-media://artwork/${artworkId}` : undefined,
            dateAdded: existing?.dateAdded || Date.now(),
            fileSize: fileStat.size,
            playCount: existing?.playCount || 0,
            lastPlayed: existing?.lastPlayed,
          };
        } catch {
          // Graceful fallback for unreadable metadata: still add track using filename
          const fileNameNoExt = path.basename(filePath, path.extname(filePath));
          updatedTracks[trackId] = {
            id: trackId,
            path: filePath,
            title: fileNameNoExt,
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: 0,
            format: path.extname(filePath).replace('.', '').toUpperCase(),
            dateAdded: existing?.dateAdded || Date.now(),
            fileSize: fileStat.size,
            playCount: existing?.playCount || 0,
          };
        }

        const now = Date.now();
        if (now - lastProgressUpdate > 120 || processed === totalFiles) {
          lastProgressUpdate = now;
          this.emitProgress(window, {
            isScanning: true,
            current: processed,
            total: totalFiles,
            currentFile: path.basename(filePath),
            tracksFound: Object.keys(updatedTracks).length,
            albumsFound: albumsSet.size,
            artistsFound: artistsSet.size,
          });
        }
      }

      // Step 3: Remove tracks whose files no longer exist on disk
      for (const id of Object.keys(updatedTracks)) {
        const tr = updatedTracks[id];
        if (!fs.existsSync(tr.path)) {
          delete updatedTracks[id];
        }
      }
    } finally {
      this.isScanning = false;
      this.emitProgress(window, {
        isScanning: false,
        current: 0,
        total: 0,
        currentFile: '',
        tracksFound: Object.keys(updatedTracks).length,
        albumsFound: albumsSet.size,
        artistsFound: artistsSet.size,
      });
    }

    return updatedTracks;
  }
}
