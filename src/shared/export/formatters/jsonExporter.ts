import type { ExportCollection } from '../types';

export function exportToJson(collection: ExportCollection): string {
  const exportData = {
    app: 'Sonora',
    version: '1.0.0',
    collection: collection.name,
    source: collection.source,
    exportedAt: new Date(collection.exportedAtTimestamp).toISOString(),
    trackCount: collection.trackCount,
    totalDuration: collection.totalDuration,
    totalDurationFormatted: collection.totalDurationFormatted,
    tracks: collection.tracks.map((t) => ({
      title: t.title,
      artist: t.artist,
      album: t.album,
      genre: t.genre,
      year: t.year,
      duration: t.duration,
      durationFormatted: t.durationFormatted,
      trackNo: t.trackNo,
      filePath: t.filePath,
    })),
  };

  return JSON.stringify(exportData, null, 2) + '\n';
}
