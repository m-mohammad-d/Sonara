import type { ExportCollection } from '../types';

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

export function exportToHtml(collection: ExportCollection, artworkDataUrl?: string): string {
  const title = escapeHtml(collection.name);
  const sourceName = escapeHtml(formatSourceName(collection.source));
  const trackCount = collection.trackCount;
  const totalDuration = escapeHtml(collection.totalDurationFormatted);
  const exportedAt = escapeHtml(collection.exportedAt);

  const rowsHtml = collection.tracks
    .map((track, index) => {
      const idx = index + 1;
      const trackTitle = escapeHtml(track.title);
      const artist = escapeHtml(track.artist);
      const album = escapeHtml(track.album);
      const genre = escapeHtml(track.genre || '—');
      const year = track.year !== null ? escapeHtml(track.year) : '—';
      const duration = escapeHtml(track.durationFormatted);

      return `      <tr>
        <td class="col-num">${idx}</td>
        <td class="col-title"><strong>${trackTitle}</strong></td>
        <td class="col-artist">${artist}</td>
        <td class="col-album">${album}</td>
        <td class="col-genre">${genre}</td>
        <td class="col-year">${year}</td>
        <td class="col-time">${duration}</td>
      </tr>`;
    })
    .join('\n');

  const artworkHtml = artworkDataUrl
    ? `<img src="${artworkDataUrl}" alt="${title}" class="collection-artwork" />`
    : `<div class="collection-artwork-fallback">
         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M9 18V5l12-2v13" />
           <circle cx="6" cy="18" r="3" />
           <circle cx="18" cy="16" r="3" />
         </svg>
       </div>`;

  return `<!DOCTYPE html>
<html lang="en" dir="auto">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Sonora Music Export</title>
  <style>
    :root {
      --bg: #ffffff;
      --card-bg: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --border-subtle: #f1f5f9;
      --accent: #2563eb;
      --accent-subtle: #eff6ff;
      --row-hover: #f1f5f9;
      --row-alt: #f8fafc;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, Tahoma, "Vazirmatn", sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.5;
      padding: 32px 24px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      gap: 24px;
      padding-bottom: 24px;
      border-bottom: 2px solid var(--border);
      margin-bottom: 28px;
    }

    .collection-artwork {
      width: 96px;
      height: 96px;
      border-radius: 16px;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    .collection-artwork-fallback {
      width: 96px;
      height: 96px;
      border-radius: 16px;
      background: var(--accent-subtle);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    .header-details {
      flex: 1;
      min-width: 0;
    }

    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      background: var(--accent-subtle);
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }

    .title {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-main);
      word-break: break-word;
      line-height: 1.25;
      margin-bottom: 6px;
    }

    .meta {
      font-size: 13px;
      color: var(--text-muted);
    }

    /* Table */
    .table-container {
      width: 100%;
      overflow-x: auto;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    thead {
      background: #f1f5f9;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }

    th {
      padding: 12px 14px;
      white-space: nowrap;
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    tbody tr:nth-child(even) {
      background-color: var(--row-alt);
    }

    tbody tr:hover {
      background-color: var(--row-hover);
    }

    .col-num {
      width: 48px;
      text-align: center;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
      font-size: 12px;
    }

    .col-title {
      min-width: 180px;
      color: var(--text-main);
    }

    .col-artist {
      min-width: 140px;
      color: var(--text-muted);
    }

    .col-album {
      min-width: 140px;
      color: var(--text-muted);
    }

    .col-genre {
      width: 110px;
      color: var(--text-muted);
    }

    .col-year {
      width: 60px;
      text-align: center;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }

    .col-time {
      width: 72px;
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: var(--text-muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Footer */
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
    }

    /* Print Stylesheet */
    @media print {
      body {
        padding: 0;
        background: #ffffff !important;
        color: #000000 !important;
      }

      .container {
        max-width: 100%;
      }

      .table-container {
        border: none;
        box-shadow: none;
        border-radius: 0;
      }

      thead {
        display: table-header-group;
        background: #f1f5f9 !important;
      }

      tbody tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      table {
        page-break-inside: auto;
      }

      @page {
        margin: 15mm;
        size: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      ${artworkHtml}
      <div class="header-details">
        <span class="badge">${sourceName}</span>
        <h1 class="title">${title}</h1>
        <p class="meta">
          <strong>${trackCount}</strong> ${trackCount === 1 ? 'track' : 'tracks'} &bull;
          Total Duration: <strong>${totalDuration}</strong> &bull;
          Exported on <strong>${exportedAt}</strong>
        </p>
      </div>
    </header>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-title">Title</th>
            <th class="col-artist">Artist</th>
            <th class="col-album">Album</th>
            <th class="col-genre">Genre</th>
            <th class="col-year">Year</th>
            <th class="col-time">Duration</th>
          </tr>
        </thead>
        <tbody>
${rowsHtml}
        </tbody>
      </table>
    </div>

    <footer class="footer">
      <span>Exported from Sonora Music Player</span>
      <span>${exportedAt}</span>
    </footer>
  </div>
</body>
</html>
`;
}
