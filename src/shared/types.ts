export const SUPPORTED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.flac',
  '.wav',
  '.m4a',
  '.aac',
  '.ogg',
  '.opus',
  '.wma',
] as const;

export type SupportedAudioExtension = (typeof SUPPORTED_AUDIO_EXTENSIONS)[number];

export interface FileImportResult {
  added: Track[];
  existing: Track[];
  unsupportedCount: number;
  failedCount: number;
  totalDropped: number;
}

export interface Track {
  id: string;
  path: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre?: string;
  year?: number;
  trackNo?: number;
  trackOf?: number;
  discNo?: number;
  duration: number; // in seconds
  bitrate?: number; // in kbps
  sampleRate?: number; // in Hz
  format?: string; // mp3, flac, wav, etc.
  artworkId?: string;
  artworkUrl?: string;
  dateAdded: number; // timestamp
  fileSize: number; // bytes
  playCount: number;
  lastPlayed?: number;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  year?: number;
  artworkUrl?: string;
  trackCount: number;
  trackIds: string[];
}

export interface Artist {
  id: string;
  name: string;
  trackCount: number;
  albumCount: number;
  artworkUrl?: string;
  albumIds: string[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  trackIds: string[];
  customArtworkUrl?: string;
}

export interface ScanProgress {
  isScanning: boolean;
  current: number;
  total: number;
  currentFile: string;
  tracksFound: number;
  albumsFound: number;
  artistsFound: number;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  bands: number[]; // 10 values: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz (-12dB to +12dB)
  preamp: number; // -12dB to +12dB
}

export type ThemeMode = "dark" | "light";
export type AccentColor =
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "green"
  | "emerald"
  | "lime"
  | "yellow"
  | "amber"
  | "orange"
  | "red"
  | "rose"
  | "pink"
  | "fuchsia"
  | "purple"
  | "violet";
export type ThemeName = ThemeMode;
export type VisualizerMode = "spectrum" | "waveform" | "bars" | "circular";
export type RepeatMode = "off" | "all" | "one";

export interface UserShortcutConfig {
  keys: string | null;
  enabled?: boolean;
}

export type UserShortcutOverrides = Record<string, UserShortcutConfig | string | null>;

export type SleepTimerMode = "off" | "duration" | "end-of-track";

export interface SleepTimerPersisted {
  mode: "off" | "duration";
  targetTime: number | null;
  durationMinutes: number | null;
}

export interface UserSettings {
  folders: string[];
  notificationsEnabled: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playbackRate: number;
  lastTrackId?: string;
  lastPosition?: number;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  theme?: string;
  visualizerMode: VisualizerMode;
  equalizer: EqualizerSettings;
  shortcuts?: UserShortcutOverrides;
  sleepTimer?: SleepTimerPersisted;
}

export interface LibraryData {
  tracks: Record<string, Track>;
  playlists: Record<string, Playlist>;
  favorites: string[];
  recentlyPlayed: string[];
  folders: string[];
  removedTrackPaths?: string[];
}

export type MediaCommand =
  | "play-pause"
  | "next-track"
  | "previous-track"
  | "stop";
