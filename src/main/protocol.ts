import { protocol, app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

export const SCHEME_NAME = 'sonora-media';

export function registerMediaSchemePrivilege(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: SCHEME_NAME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
        bypassCSP: true,
      },
    },
  ]);
}

const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.opus': 'audio/opus',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function setupMediaProtocol(): void {
  const artworkCacheDir = path.join(app.getPath('userData'), 'artwork-cache');
  if (!fs.existsSync(artworkCacheDir)) {
    fs.mkdirSync(artworkCacheDir, { recursive: true });
  }

  protocol.handle(SCHEME_NAME, async (request) => {
    try {
      const url = new URL(request.url);
      const host = url.host; // 'audio' or 'artwork'
      let decodedPath = decodeURIComponent(url.pathname);

      // On Windows, pathname may start with a leading slash before drive letter: /C:/...
      if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(decodedPath)) {
        decodedPath = decodedPath.slice(1);
      }

      let filePath = '';
      if (host === 'audio') {
        filePath = decodedPath;
      } else if (host === 'artwork') {
        // Strip leading slash if present
        const filename = decodedPath.replace(/^\/+/, '');
        filePath = path.join(artworkCacheDir, filename);
      } else {
        return new Response('Invalid media category', { status: 400 });
      }

      if (!fs.existsSync(filePath)) {
        return new Response('File not found', { status: 404 });
      }

      const stat = await fs.promises.stat(filePath);
      const fileSize = stat.size;
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || (host === 'artwork' ? 'image/jpeg' : 'application/octet-stream');

      const rangeHeader = request.headers.get('range');

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
          return new Response('Requested range not satisfiable', {
            status: 416,
            headers: { 'Content-Range': `bytes */${fileSize}` },
          });
        }

        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        const webStream = Readable.toWeb(fileStream);

        return new Response(webStream as unknown as ReadableStream, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const fileStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(fileStream);

      return new Response(webStream as unknown as ReadableStream, {
        status: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(`Media stream error: ${(error as Error).message}`, { status: 500 });
    }
  });
}
