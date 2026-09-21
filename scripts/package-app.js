import fs from 'node:fs';
import path from 'node:path';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function packageApp() {
  const rootDir = process.cwd();
  const electronDistDir = path.join(rootDir, 'node_modules', 'electron', 'dist');
  const outputDir = path.join(rootDir, 'release', 'Sonora-win32-x64');
  const appDir = path.join(outputDir, 'resources', 'app');

  console.log('Packaging Sonora standalone desktop app...');

  if (!fs.existsSync(electronDistDir)) {
    throw new Error(`Electron binaries not found at ${electronDistDir}`);
  }

  // Clean or create output directory
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  // 1. Copy Electron distribution
  console.log('Copying Electron binaries...');
  copyDirRecursive(electronDistDir, outputDir);

  // 2. Rename electron.exe -> Sonora.exe
  const defaultExe = path.join(outputDir, 'electron.exe');
  const targetExe = path.join(outputDir, 'Sonora.exe');
  if (fs.existsSync(defaultExe)) {
    fs.renameSync(defaultExe, targetExe);
  }

  // 3. Populate resources/app
  console.log('Copying bundled application assets...');
  fs.mkdirSync(appDir, { recursive: true });

  const distSrc = path.join(rootDir, 'dist');
  const distElectronSrc = path.join(rootDir, 'dist-electron');

  if (!fs.existsSync(distSrc) || !fs.existsSync(distElectronSrc)) {
    throw new Error('Build output missing. Run "npm run build" first.');
  }

  copyDirRecursive(distSrc, path.join(appDir, 'dist'));
  copyDirRecursive(distElectronSrc, path.join(appDir, 'dist-electron'));

  // 4. Create minimal production package.json
  const prodPkg = {
    name: 'sonora-music-player',
    productName: 'Sonora',
    version: '1.0.0',
    main: 'dist-electron/main/index.js',
    type: 'module',
  };

  fs.writeFileSync(
    path.join(appDir, 'package.json'),
    JSON.stringify(prodPkg, null, 2),
    'utf-8'
  );

  console.log('====================================================');
  console.log('Sonora Windows Executable created successfully!');
  console.log(`Executable Path: ${targetExe}`);
  console.log('====================================================');
}

packageApp().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
