import { BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export async function generatePdf(
  htmlContent: string,
  collectionTitle: string
): Promise<Buffer> {
  let printWin: BrowserWindow | null = null;
  let tempHtmlPath: string | null = null;

  try {
    const tempDir = os.tmpdir();
    tempHtmlPath = path.join(
      tempDir,
      `sonora_export_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.html`
    );
    await fs.promises.writeFile(tempHtmlPath, htmlContent, 'utf-8');

    printWin = new BrowserWindow({
      show: false,
      width: 1200,
      height: 800,
      webPreferences: {
        offscreen: true,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await printWin.loadFile(tempHtmlPath);

    await printWin.webContents.executeJavaScript(`
      new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true), { once: true });
        }
      })
    `);

    const cleanTitle = collectionTitle.replace(/[<>"'&]/g, '');

    const pdfBuffer = await printWin.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      pageSize: 'A4',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.4,
        right: 0.4,
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span>Sonora &bull; ${cleanTitle}</span>
          <span class="date"></span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span>Sonora Music Player</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    return pdfBuffer;
  } finally {
    if (printWin && !printWin.isDestroyed()) {
      printWin.destroy();
      printWin = null;
    }
    if (tempHtmlPath) {
      try {
        await fs.promises.unlink(tempHtmlPath);
      } catch {
        // Cleanup temp file failure is ignored
      }
    }
  }
}
