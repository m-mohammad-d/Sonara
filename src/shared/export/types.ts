export type ExportFormat =
  | 'html'
  | 'pdf'
  | 'csv'
  | 'tsv'
  | 'json'
  | 'm3u8'
  | 'txt'
  | 'md';

export type ExportSource =
  | 'library'
  | 'playlist'
  | 'queue'
  | 'favorites'
  | 'recently-played'
  | 'album'
  | 'artist'
  | 'genre';

export interface ExportTrack {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number | null;
  duration: number | null;
  durationFormatted: string;
  trackNo: number | null;
  filePath: string;
}

export interface ExportCollection {
  name: string;
  source: ExportSource;
  exportedAt: string;
  exportedAtTimestamp: number;
  trackCount: number;
  totalDuration: number;
  totalDurationFormatted: string;
  tracks: ExportTrack[];
  artworkUrl?: string;
  artworkId?: string;
}

export interface ExportRequest {
  collection: ExportCollection;
  format: ExportFormat;
}

export interface ExportResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  error?: string;
}
