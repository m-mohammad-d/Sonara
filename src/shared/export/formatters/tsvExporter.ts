import type { ExportCollection } from '../types';

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function sanitizeTsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection defense
  if (str.length > 0 && FORMULA_PREFIXES.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  const needsQuotes =
    str.includes('\t') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r') ||
    str.startsWith("'");

  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function exportToTsv(collection: ExportCollection): string {
  const headers = [
    'Title',
    'Artist',
    'Album',
    'Genre',
    'Year',
    'Duration',
    'Track Number',
    'File Path',
  ];

  const rows: string[] = [];
  rows.push(headers.map(sanitizeTsvField).join('\t'));

  for (const track of collection.tracks) {
    const fields = [
      track.title,
      track.artist,
      track.album,
      track.genre,
      track.year !== null ? track.year : '',
      track.durationFormatted,
      track.trackNo !== null ? track.trackNo : '',
      track.filePath,
    ];
    rows.push(fields.map(sanitizeTsvField).join('\t'));
  }

  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}
