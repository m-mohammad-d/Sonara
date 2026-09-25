import type { Track } from '../types';
import type { ExportCollection, ExportSource, ExportTrack } from './types';

export function formatExportDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const totalSeconds = Math.round(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const hours = Math.floor(mins / 60);

  if (hours > 0) {
    const remMins = mins % 60;
    return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function createExportCollection(
  tracks: Track[],
  collectionName: string,
  source: ExportSource
): ExportCollection {
  const now = new Date();
  const exportedAt = now.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const exportTracks: ExportTrack[] = tracks.map((track) => ({
    title: track.title || 'Unknown Title',
    artist: track.artist || 'Unknown Artist',
    album: track.album || 'Unknown Album',
    genre: track.genre || '',
    year: track.year ?? null,
    duration: typeof track.duration === 'number' && !isNaN(track.duration) ? track.duration : null,
    durationFormatted: formatExportDuration(track.duration),
    trackNo: track.trackNo ?? null,
    filePath: track.path || '',
  }));

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  // Pick first available artwork identifier if present
  const firstArtworkTrack = tracks.find((t) => t.artworkId || t.artworkUrl);

  return {
    name: collectionName.trim() || 'Music List',
    source,
    exportedAt,
    exportedAtTimestamp: now.getTime(),
    trackCount: exportTracks.length,
    totalDuration,
    totalDurationFormatted: formatExportDuration(totalDuration),
    tracks: exportTracks,
    artworkUrl: firstArtworkTrack?.artworkUrl,
    artworkId: firstArtworkTrack?.artworkId,
  };
}
