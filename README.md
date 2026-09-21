# Sonora

A desktop music player for local audio collections built with Electron, React, TypeScript, and the Web Audio API.

---

## Overview

Sonora is designed specifically for playing and managing local music libraries. Instead of relying on cloud streaming services or heavy electron web wrappers, Sonora focuses on audio performance, low-latency playback, local file privacy, and a responsive desktop user interface.

Your audio files stay directly where they are on your filesystem. Sonora indexes metadata, extracts cover art into a local cache, and streams audio directly from disk with support for partial range requests and real-time DSP equalization.

---

## Features

### Music Library & Browsing
- **Local Directory Management**: Add, monitor, and remove music folders across local or external drives.
- **Recursive Audio Scanning**: Asynchronous background scanner detects audio files without blocking UI interactions.
- **Batch Metadata Extraction**: Reads Title, Artist, Album, Album Artist, Genre, Year, Track/Disc numbers, Duration, Bitrate, and Sample Rate.
- **Artwork Caching**: Embedded ID3/Vorbis/MP4 pictures are extracted, hashed, and cached locally in application data.
- **Library Views**:
  - **All Songs**: Sortable table by Title, Artist, Album, Duration, and Date Added (ascending and descending).
  - **Albums**: Grid of album cards with artwork, track count, release year, and hover play actions.
  - **Album Detail**: View complete album tracklists with disc/track numbers and total album duration.
  - **Artists**: Grid of artists with album and song counts.
  - **Artist Detail**: Artist discography with grouped albums and full song listings.
  - **Genres**: Browse library categorized by genre tags.
  - **Genre Detail**: Dedicated view for tracks belonging to a specific genre.
- **Fast Search**: Instant filtering across titles, artists, albums, and genres.

### Playback & Audio Engine
- **Web Audio API Graph**: Integrates HTML5 `<audio>` with `AudioContext`, connecting a media element source through an equalizer filter chain, master gain, and real-time analyser node.
- **10-Band Graphic Equalizer**:
  - Center frequencies: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, and 16kHz.
  - Gain range: -12 dB to +12 dB per band.
  - Preamp gain adjustment: -12 dB to +12 dB.
  - Presets: *Flat*, *Bass Boost*, *Treble Boost*, *Vocal*, *Rock*, *Pop*, *Classical*, *Electronic*, and *Custom*.
  - Equalizer bypass/enable toggle.
- **Audio Visualizer**:
  - 4 real-time visualizer modes: Continuous Spectrum Wave, Oscilloscope Waveform, Frequency Bars, and Radial Circular Spectrum.
  - Automatically pauses render loop when audio is stopped to preserve CPU.
- **Playback Controls**: Play, Pause, Previous, Next, Seek with hover timestamp preview, Volume slider, Mute toggle.
- **Shuffle & Repeat**:
  - Fisher-Yates shuffle mode.
  - 3-state repeat modes: Off, Repeat All, Repeat One.
- **Variable Playback Rate**: Speed selection (0.75x, 1x, 1.25x, 1.5x, 2x).

### Queue Management
- **Slide-Over Queue Drawer**: View upcoming tracks and currently playing song.
- **Queue Manipulation**: Reorder tracks up or down, remove individual items, or clear queue.
- **Queue Advancement**: Automatically advances to the next queued item upon song completion.

### Playlists & Collections
- **Playlists**: Create custom playlists with names and descriptions.
- **Playlist Management**: Inline rename, reorder tracks up and down, delete playlists.
- **Favorites**: Star tracks from any view; dedicated collection view for favorited songs.
- **Recently Played**: Chronological timeline recording songs played for at least 15 seconds.

### Desktop Integration
- **Custom Frameless Titlebar**: Integrated window controls (minimize, maximize/restore, close), view navigation history (back/forward), and global search input.
- **Context Menus**: Desktop right-click menu with viewport edge clamping:
  - *Play*
  - *Play Next*
  - *Add to Queue*
  - *Add to Playlist* (with sub-menu of user playlists)
  - *Add to / Remove from Favorites*
  - *Show in Folder* (opens file location in OS file manager)
- **Global Keyboard Shortcuts**: Control playback from anywhere in the app with input field collision avoidance.

---

## Keyboard Shortcuts

The following shortcuts are active globally throughout the application and automatically deactivate when typing in text fields:

| Key | Action |
| --- | --- |
| `Space` | Play / Pause playback |
| `←` | Seek 5 seconds backward |
| `→` | Seek 5 seconds forward |
| `↑` | Increase volume by 5% |
| `↓` | Decrease volume by 5% |
| `M` | Mute / Unmute audio |
| `N` | Next track in queue |
| `P` | Previous track (or restart if played > 3s) |
| `Esc` | Close open dialogs, context menus, and queue drawer |

---

## Supported Audio Formats

Sonora scans and plays the following audio formats:

| Format | Extensions |
| --- | --- |
| MP3 | `.mp3` |
| FLAC | `.flac` |
| WAV | `.wav` |
| OGG / Vorbis | `.ogg` |
| M4A / AAC | `.m4a`, `.aac` |
| Opus | `.opus` |
| WMA | `.wma` |

---

## Tech Stack

| Technology | Role |
| --- | --- |
| **Electron 44** | Desktop application runtime |
| **React 19** | User interface components |
| **TypeScript 7** | Static type checking and interfaces |
| **Vite 8** | Development server and module bundler |
| **Tailwind CSS 4** | Styling and responsive design system |
| **Zustand 5** | Lightweight application state management |
| **Web Audio API** | AudioContext, BiquadFilterNodes, AnalyserNode |
| **music-metadata 11** | Local audio tag and artwork extraction |
| **Lucide React** | Desktop iconography |

---

## Architecture

```
src/
├── main/                 # Electron Main Process
│   ├── index.ts          # Window creation, lifecycle, single-instance lock
│   ├── protocol.ts       # 'sonora-media://' streaming protocol (HTTP 206) & artwork serving
│   ├── scanner.ts        # Async recursive filesystem scanner & metadata extraction
│   ├── store.ts          # Atomic JSON persistence in userData
│   └── ipc.ts            # Type-safe IPC handlers
│
├── preload/              # Secure Preload Script
│   └── index.ts          # ContextBridge API exposing window.electronAPI
│
├── shared/               # Shared Definitions
│   ├── types.ts          # Track, Album, Artist, Playlist, Settings interfaces
│   └── channels.ts       # IPC channel constants
│
└── renderer/             # React Renderer Process
    ├── audio/            # Web Audio engine, node graph, and equalizer presets
    ├── stores/           # Zustand state (player, library, playlists, settings, UI)
    ├── hooks/            # Global keyboard shortcuts hook
    └── components/       # UI layout, views, visualizer, equalizer, and context menus
```

### Audio Streaming Protocol
Sonora registers a custom privileged scheme `sonora-media://` in the main process. This serves local files using byte-range requests (`HTTP 206 Partial Content`). This allows instant seeking across large lossless files (such as 24-bit FLAC or high-bitrate WAV) without buffering the entire file into memory or encountering browser file access restrictions.

### Preload & Security
- `contextIsolation` is enabled.
- `nodeIntegration` is disabled in the renderer.
- The renderer communicates exclusively through typed IPC methods exposed via `contextBridge`.
- Arbitrary filesystem access is not permitted from the frontend.

---

## Data Storage & Privacy

All application data is kept locally on your machine. Sonora does not upload files or transmit telemetry.

- **Storage Location**: `app.getPath('userData')/data/`
  - `library.json`: Scanned track metadata, playlists, favorites, and history.
  - `settings.json`: User preferences, equalizer presets, volume, and playback state.
- **Artwork Cache**: `app.getPath('userData')/artwork-cache/`
- **File Safety**: Your original music files are never altered, moved, or deleted by Sonora. Persistence operations use atomic temporary file writing (`.tmp` to rename) to prevent database corruption.

---

## Requirements

- **Node.js**: `v20.0.0` or later (tested on `v22.18.0`)
- **npm**: `v10.0.0` or later
- **Operating System**: Windows 10 / 11 (64-bit)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/m-mohammad-d/Sonara.git
   cd Sonara
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Development

Run the application in development mode with hot reload:

```bash
npm run dev
```

Run TypeScript strict type checking:

```bash
npm run typecheck
```

---

## Production Build & Packaging

1. Build the production assets:
   ```bash
   npm run build
   ```

2. Run the production build via Electron:
   ```bash
   npm start
   ```

3. Package a standalone Windows executable (`Sonora.exe`):
   ```bash
   npm run package
   ```
   The packaged standalone application will be generated in:
   ```
   release/Sonora-win32-x64/Sonora.exe
   ```

---

## Project Status

Sonora is in **completed initial release** (`v1.0.0`) with local folder scanning, metadata parsing, Web Audio playback, equalizer DSP, playlist management, and standalone packaging fully implemented and verified.

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Ensure strict TypeScript type checks pass: `npm run typecheck`.
4. Ensure the build succeeds: `npm run build`.
5. Commit your changes and submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).
