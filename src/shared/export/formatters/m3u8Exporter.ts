import type { ExportCollection } from '../types';

export function exportToM3u8(collection: ExportCollection): string {
  const lines: string[] = ['#EXTM3U', `#PLAYLIST:${collection.name}`];

  for (const track of collection.tracks) {
    const rawPath = track.filePath?.trim();
    if (!rawPath) {
      continue;
    }

    const durationSec = track.duration !== null && !isNaN(track.duration)
      ? Math.round(track.duration)
      : -1;

    const artist = track.artist || 'Unknown Artist';
    const title = track.title || 'Unknown Title';

    lines.push(`#EXTINF:${durationSec},${artist} - ${title}`);
    lines.push(rawPath);
  }

  return lines.join('\r\n') + '\r\n';
}
