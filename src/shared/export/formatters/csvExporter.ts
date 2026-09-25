import type { ExportCollection } from '../types';

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function sanitizeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection defense: neutralize spreadsheet expressions by prepending a single quote
  if (str.length > 0 && FORMULA_PREFIXES.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Quote the field if it contains commas, double quotes, newlines, carriage returns, or single quote prefix
  const needsQuotes =
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r') ||
    str.startsWith("'");

  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function exportToCsv(collection: ExportCollection): string {
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
  rows.push(headers.map(sanitizeCsvField).join(','));

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
    rows.push(fields.map(sanitizeCsvField).join(','));
  }

  // UTF-8 BOM for Microsoft Excel compatibility + CRLF line endings
  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}
