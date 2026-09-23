import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { LibraryData, UserSettings } from '../shared/types';

const DEFAULT_SETTINGS: UserSettings = {
  folders: [],
  notificationsEnabled: true,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'off',
  shuffle: false,
  playbackRate: 1,
  theme: 'dark',
  visualizerMode: 'spectrum',
  equalizer: {
    enabled: true,
    preset: 'Flat',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0,
  },
};

const DEFAULT_LIBRARY_DATA: LibraryData = {
  tracks: {},
  playlists: {},
  favorites: [],
  recentlyPlayed: [],
  folders: [],
};

export class AppStore {
  private baseDir: string;
  private libraryFilePath: string;
  private settingsFilePath: string;
  private libraryData: LibraryData;
  private userSettings: UserSettings;

  constructor() {
    this.baseDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    this.libraryFilePath = path.join(this.baseDir, 'library.json');
    this.settingsFilePath = path.join(this.baseDir, 'settings.json');

    this.libraryData = this.loadJSON<LibraryData>(this.libraryFilePath, DEFAULT_LIBRARY_DATA);
    this.userSettings = this.loadJSON<UserSettings>(this.settingsFilePath, DEFAULT_SETTINGS);
  }

  private loadJSON<T>(filePath: string, fallback: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { ...fallback, ...JSON.parse(content) };
      }
    } catch (err) {
      console.error(`Failed to load JSON from ${filePath}:`, err);
    }
    return fallback;
  }

  private async saveJSON<T>(filePath: string, data: T): Promise<void> {
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    try {
      await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, filePath);
    } catch (err) {
      console.error(`Failed to save JSON to ${filePath}:`, err);
      if (fs.existsSync(tempPath)) {
        try {
          await fs.promises.unlink(tempPath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  public getLibrary(): LibraryData {
    return this.libraryData;
  }

  public async setLibrary(data: Partial<LibraryData>): Promise<LibraryData> {
    this.libraryData = { ...this.libraryData, ...data };
    await this.saveJSON(this.libraryFilePath, this.libraryData);
    return this.libraryData;
  }

  public getSettings(): UserSettings {
    return this.userSettings;
  }

  public async setSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    this.userSettings = { ...this.userSettings, ...settings };
    await this.saveJSON(this.settingsFilePath, this.userSettings);
    return this.userSettings;
  }

  public async toggleFavorite(trackId: string): Promise<string[]> {
    const set = new Set(this.libraryData.favorites);
    if (set.has(trackId)) {
      set.delete(trackId);
    } else {
      set.add(trackId);
    }
    this.libraryData.favorites = Array.from(set);
    await this.saveJSON(this.libraryFilePath, this.libraryData);
    return this.libraryData.favorites;
  }

  public async recordPlay(trackId: string): Promise<void> {
    const track = this.libraryData.tracks[trackId];
    if (track) {
      track.playCount = (track.playCount || 0) + 1;
      track.lastPlayed = Date.now();
    }
    // Update recently played list (keep up to 100 most recent unique items)
    const recent = this.libraryData.recentlyPlayed.filter((id) => id !== trackId);
    recent.unshift(trackId);
    if (recent.length > 100) {
      recent.length = 100;
    }
    this.libraryData.recentlyPlayed = recent;
    await this.saveJSON(this.libraryFilePath, this.libraryData);
  }
}
