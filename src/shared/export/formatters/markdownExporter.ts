import type { ExportCollection } from '../types';

function sanitizeMdCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

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

export function exportToMarkdown(collection: ExportCollection): string {
  const lines: string[] = [
    `# Sonora — ${sanitizeMdCell(collection.name)}`,
    '',
    `- **Collection:** ${sanitizeMdCell(collection.name)}`,
    `- **Source:** ${formatSourceName(collection.source)}`,
    `- **Tracks:** ${collection.trackCount}`,
    `- **Total Duration:** ${collection.totalDurationFormatted}`,
    `- **Exported:** ${collection.exportedAt}`,
    '',
    '| # | Title | Artist | Album | Genre | Year | Duration |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | ---: |',
  ];

  collection.tracks.forEach((track, index) => {
    const row = [
      String(index + 1),
      sanitizeMdCell(track.title),
      sanitizeMdCell(track.artist),
      sanitizeMdCell(track.album),
      sanitizeMdCell(track.genre),
      track.year !== null ? String(track.year) : '',
      track.durationFormatted,
    ];
    lines.push(`| ${row.join(' | ')} |`);
  });

  return lines.join('\n') + '\n';
}
