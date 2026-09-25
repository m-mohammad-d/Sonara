import type { ExportCollection } from '../types';

function formatSourceName(source: string): string {
  switch (source) {
    case 'library':
      return 'Music Library';
    case 'playlist':
      return 'Playlist';
    case 'queue':
      return 'Playback Queue';
    case 'favorites':
      return 'Favorites';
    case 'recently-played':
      return 'Recently Played';
    case 'album':
      return 'Album';
    case 'artist':
      return 'Artist';
    case 'genre':
      return 'Genre';
    default:
      return source;
  }
}

export function exportToTxt(collection: ExportCollection): string {
  const lines: string[] = [
    'Sonora Music Player',
    `Collection:     ${collection.name}`,
    `Source:         ${formatSourceName(collection.source)}`,
    `Tracks:         ${collection.trackCount}`,
    `Total Duration: ${collection.totalDurationFormatted}`,
    `Exported:       ${collection.exportedAt}`,
    '',
    '--------------------------------------------------------------------------------',
    '',
  ];

  const padLength = String(collection.tracks.length).length;

  collection.tracks.forEach((track, index) => {
    const num = String(index + 1).padStart(padLength, ' ');
    const albumPart = track.album ? ` (${track.album})` : '';
    const genrePart = track.genre ? ` [${track.genre}]` : '';
    const durPart = track.durationFormatted ? ` - ${track.durationFormatted}` : '';
    lines.push(`${num}. ${track.title} — ${track.artist}${albumPart}${genrePart}${durPart}`);
  });

  return lines.join('\r\n') + '\r\n';
}
