# Sonora

A local-first desktop music player for Windows built with Electron, React, TypeScript, and the Web Audio API.

Sonora is designed for listeners who maintain their own local music libraries. Instead of relying on cloud streaming services or heavy web wrappers, Sonora provides a fast, standalone desktop experience focused on low-latency audio playback, real-time DSP equalization, audio visualization, flexible collection export, and total privacy for your music files.

---

## Feature Summary

| Capability | Details |
| --- | --- |
| **Local-First Audio Engine** | Direct disk streaming via custom `sonora-media://` protocol with HTTP 206 byte-range seeking |
| **Format Support** | MP3, FLAC, WAV, OGG, M4A, AAC, Opus, and WMA |
| **Audio Processing** | 10-band parametric equalizer (-12 dB to +12 dB), preamp control, and 8 acoustic presets |
| **Real-Time Visualizer** | 4 Canvas visualizer modes (Spectrum Wave, Oscilloscope, Frequency Bars, Circular Ring) |
| **Sleep Timer** | Timed countdown (1–720 min), End of Current Track mode, and desktop completion alerts |
| **Collection Export** | Export libraries, playlists, queue, albums, and favorites to HTML, PDF, CSV, TSV, JSON, M3U8, TXT, and Markdown |
| **Desktop Integration** | Frameless window, system tray minimize, global hardware media keys, and native Windows notifications |
| **Appearance & Theming** | Dedicated Dark and Light modes with 16 vibrant accent color options |
| **Hotkeys** | Fully customizable keyboard shortcuts with conflict detection and reset controls |
| **Zero Telemetry** | 100% offline, no analytics, no user accounts, and zero modification of original music files |

---

## Features

### Music Library

* **Multi-Directory Management**: Add and monitor multiple local or external storage folders.
* **Recursive Scanning**: Asynchronously scans directory trees and subfolders while skipping hidden system directories.
* **Smart Incremental Indexing**: Compares file sizes and paths to skip unmodified files during rescans.
* **Dead Track Pruning**: Automatically prunes library references for files that have been deleted or moved from disk.
* **Non-Blocking Background Scanner**: Real-time progress updates (current file, progress percentage, tracks/albums/artists found) with cancel capability.
* **Metadata Extraction**: Reads embedded ID3, Vorbis, and MP4 tags including Title, Artist, Album, Album Artist, Genre, Year, Track Number, Disc Number, Duration, Bitrate, Sample Rate, and Audio Format.
* **Artwork Caching**: Extracts embedded album cover art, hashes contents using MD5, and caches them in the application user data directory.
* **Library Views**:
  * **All Songs**: Sortable tabular list with sort indicators for Title, Artist, Album, Duration, and Date Added (ascending and descending).
  * **Albums**: Responsive card grid with album artwork, release year, track count, and quick play triggers.
  * **Album Detail**: Disc- and track-number-ordered tracklists with total duration calculations.
  * **Artists**: Grid overview displaying total albums and song counts per artist.
  * **Artist Detail**: Artist discography view grouping tracks by album alongside full song listings.
  * **Genres**: Categorized library overview with dedicated genre detail track listings.
* **Instant Search**: Real-time multi-field search across song titles, artists, albums, and genres.

### Playback

* **Low-Latency Streaming**: Integrates HTML5 `<audio>` with the Web Audio API through a custom privileged protocol (`sonora-media://`) supporting HTTP 206 Partial Content for instant seeking within large lossless audio files.
* **Playback Controls**: Play, Pause, Previous Track, Next Track, Stop, Seek bar with interactive scrub preview tooltip, Volume control, and Mute toggle.
* **Playback Modes**:
  * **Shuffle**: Fisher-Yates randomization.
  * **Repeat**: Three-state toggle (Off, Repeat All, Repeat One).
* **Variable Playback Rate**: Speed selection with dedicated presets (0.75x, 1x, 1.25x, 1.5x, 2x).
* **Background Continuity**: Chromium background throttling is disabled to guarantee stutter-free playback when Sonora is minimized or running behind other windows.

### Queue & Playlists

* **Slide-Over Queue Drawer**: Fast slide-out panel displaying current track status and upcoming songs.
* **Queue Reordering**: Move tracks up or down within the queue, remove individual items, or clear the entire queue with safety confirmation.
* **On-the-Fly Enqueueing**: Context menu actions for *Play Next* and *Add to Queue* from any view.
* **Custom Playlists**: Create, name, inline-rename, and delete custom playlists.
* **Track Ordering in Playlists**: Reorder playlist tracks up or down, or remove songs individually.
* **Favorites Collection**: Quick star/unstar toggle on any track from tables, player bar, or context menus; accessible via a dedicated Favorites view.
* **Listening History**: Automatically logs songs played into a Recently Played history list (capped at the 100 most recent unique tracks).

### Equalizer & Audio Processing

* **10-Band Graphic Equalizer**:
  * Center frequencies: **32 Hz, 64 Hz, 125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz, 16 kHz**.
  * Gain range: **-12 dB to +12 dB** per band with 0.5 dB step precision.
  * Preamp gain: **-12 dB to +12 dB** master pre-amplification.
  * Bypass toggle: Enable or disable equalization processing in real time.
* **EQ Presets**: *Flat*, *Bass Boost*, *Treble Boost*, *Vocal*, *Rock*, *Pop*, *Classical*, and *Electronic*, plus automatic *Custom* preset tracking.
* **Sleep Timer**:
  * Quick duration presets: 15, 30, 45, 60, 90, and 120 minutes.
  * Custom timer option: Specify any duration between 1 and 720 minutes (up to 12 hours).
  * End of Current Track mode: Gracefully pauses playback as soon as the active song finishes.
  * Countdown indicator in the player bar and settings view.
  * Native desktop notifications and application toasts upon timer completion.
  * Persisted state in user settings with automatic calculation across window visibility changes.

### Visualizer

* **Hardware-Accelerated Canvas Rendering**: Real-time audio analysis using `AnalyserNode` (FFT size 256, smoothing 0.82).
* **4 Visualization Modes**:
  * **Spectrum Wave**: Smooth continuous gradient wave filled to the baseline.
  * **Waveform**: Oscilloscope time-domain waveform.
  * **Frequency Bars**: 48 frequency bars with rounded corners and vertical accent gradients.
  * **Circular Ring**: Radial frequency spectrum reacting from center outward.
* **Dynamic Palette Integration**: Visualizers automatically inherit active theme accent colors.
* **CPU/GPU Efficient**: Animation frame loops automatically halt when playback is paused or stopped.

### Desktop Experience

* **Custom Frameless Title Bar**: Window navigation history (Back and Forward buttons), centralized search input, background scan progress indicator, and minimize/maximize/close window controls.
* **System Tray Integration**:
  * Closing the main window minimizes Sonora directly to the Windows system tray.
  * System tray menu provides "Show Sonora" and "Quit Sonora" actions.
  * Single-click on the tray icon restores and focuses the window.
* **Single-Instance Enforcement**: `requestSingleInstanceLock` ensures only one instance runs; launching a second instance brings the existing window to the front.
* **Global Hardware Media Keys**: System-wide support via Electron `globalShortcut` for `MediaPlayPause`, `MediaNextTrack`, `MediaPreviousTrack`, and `MediaStop` (functional even when Sonora is unfocused or minimized).
* **Context Menus**: Right-click context menus with automatic viewport edge clamping across all views:
  * Play / Play Next / Add to Queue
  * Add to Playlist (with nested submenu listing user playlists)
  * Add to / Remove from Favorites
  * Export Track / Export Playlist (nested format submenus)
  * Show in Folder (reveals audio file in Windows File Explorer)
* **Native Desktop Notifications**: Windows toast notifications for track changes (with title and artist) and sleep timer triggers.

### Appearance

* **Theme Modes**: Dedicated **Dark Mode** (optimized for low-light focus) and **Light Mode** (high-contrast daylight clarity).
* **16 Accent Color Themes**: Blue, Sky, Cyan, Teal, Green, Emerald, Lime, Yellow, Amber, Orange, Red, Rose, Pink, Fuchsia, Purple, and Violet.
* **Instant Switching**: Theme changes update CSS custom properties immediately across the entire UI without requiring an application restart.
* **Persistent Appearance**: Theme mode and accent selections are stored in both user settings and local storage.

### Export System

Sonora includes an export engine capable of generating standalone documents, structured spreadsheets, and playlist files directly from your music library:

* **Collection Sources Supported**:
  * Entire Music Library / Current Search Results
  * Custom User Playlists
  * Playback Queue
  * Favorites
  * Recently Played History
  * Specific Album Tracklists
  * Specific Artist Discographies
  * Specific Genre Collections
  * Individual Tracks (via context menu)
* **8 Export Formats Supported**:
  * **HTML Webpage (`.html`)**: Self-contained, responsive HTML file containing complete collection statistics, sortable table layout, CSS styling, and embedded base64 album cover artwork.
  * **PDF Document (`.pdf`)**: Formatted print document generated natively via Electron's headless print engine (`printToPDF`) with custom headers, page numbering footers, and A4 page geometry.
  * **Markdown Table (`.md`)**: GitHub-flavored markdown document with summary metadata and formatted track tables.
  * **CSV Spreadsheet (`.csv`)**: RFC 4180-compliant comma-separated values compatible with Excel, Google Sheets, and data tools.
  * **TSV Spreadsheet (`.tsv`)**: Tab-separated values file.
  * **JSON Document (`.json`)**: Formatted structured JSON data with track metadata and collection summary metrics.
  * **M3U8 Playlist (`.m3u8`)**: Extended M3U playlist file with `#EXTINF` track info and absolute filesystem audio paths.
  * **Plain Text (`.txt`)**: Clean, human-readable text document.

---

## Tech Stack

| Technology | Purpose | Version |
| --- | --- | --- |
| **Electron** | Desktop application container & native OS integration | 44.4.3 |
| **React** | Component-based user interface architecture | 19.3.0 |
| **TypeScript** | Static type checking and strict interface definitions | 7.0.2 |
| **Vite** | Frontend module bundler and development server | 8.3.0 |
| **Tailwind CSS** | Utility-first CSS styling and theming system | 4.3.3 |
| **Zustand** | Lightweight client state management | 5.0.15 |
| **Web Audio API** | Audio graph, 10-band biquad filters, and FFT analyser | Native |
| **music-metadata** | Audio file ID3/Vorbis tag parsing and artwork extraction | 11.15.0 |
| **Lucide React** | Desktop interface iconography | 1.47.0 |
| **Electron Builder** | Windows packaging (NSIS installer & portable binaries) | 26.15.3 |

---

## Supported Audio Formats

Sonora scans, parses metadata from, and plays the following audio file formats:

| Format | Extensions | Metadata Parser | Playback Mechanism |
| --- | --- | --- | --- |
| **MP3** | `.mp3` | ID3v1, ID3v2.3, ID3v2.4 | `sonora-media://` + Web Audio API |
| **FLAC** | `.flac` | Vorbis Comment | `sonora-media://` + Web Audio API |
| **WAV** | `.wav` | RIFF / INFO chunks | `sonora-media://` + Web Audio API |
| **OGG / Vorbis** | `.ogg` | Vorbis Comment | `sonora-media://` + Web Audio API |
| **M4A / AAC** | `.m4a`, `.aac` | MP4 / iTunes metadata | `sonora-media://` + Web Audio API |
| **Opus** | `.opus` | Opus Comment | `sonora-media://` + Web Audio API |
| **WMA** | `.wma` | ASF / Windows Media | `sonora-media://` + Web Audio API |

---

## Architecture

Sonora follows Electron's process separation model, enforcing strict process sandboxing and context isolation.

```
src/
├── main/                       # Electron Main Process (Node.js runtime)
│   ├── index.ts                # App lifecycle, single-instance lock, window creation
│   ├── ipc.ts                  # IPC handlers & global media shortcut registration
│   ├── protocol.ts             # Custom sonora-media:// streaming scheme (HTTP 206)
│   ├── scanner.ts              # Async recursive audio file & metadata scanner
│   ├── store.ts                # Atomic JSON file persistence (userData/data/)
│   ├── tray.ts                 # Windows notification area tray icon & menu
│   └── export/                 # Main process export handlers
│       ├── exportManager.ts    # Native save dialogs and export file dispatch
│       └── pdfExporter.ts      # Offscreen window generation for native PDF printing
│
├── preload/                    # Context Isolation Preload Bridge
│   └── index.ts                # Typed window.electronAPI exposed via contextBridge
│
├── shared/                     # Shared Types and Contract Definitions
│   ├── channels.ts             # IPC channel string constants
│   ├── types.ts                # Track, Album, Artist, Playlist, Settings interfaces
│   └── export/                 # Export formats, types, and file generators
│       ├── types.ts            # ExportRequest, ExportCollection, ExportFormat types
│       ├── normalize.ts        # Data normalization for exportable collections
│       └── formatters/         # HTML, CSV, TSV, JSON, M3U8, TXT, and Markdown formatters
│
└── renderer/                   # React Renderer Process (Browser sandbox)
    ├── App.tsx                 # Root layout, navigation router, modals, toasts
    ├── audio/                  # Web Audio API engine, graph connection, EQ presets
    ├── components/             # Reusable UI widgets, layout panels, views, visualizer
    ├── hooks/                  # Global shortcut hook & event listeners
    ├── stores/                 # Zustand state stores (player, library, playlists, settings, shortcuts, UI)
    ├── styles/                 # Tailwind CSS styles and dynamic theme variables
    ├── theme/                  # Dark/light mode definitions & 16 accent presets
    └── utils/                  # Key capture utilities, shortcut registry, formatters
```

### Key Architectural Concepts

1. **Custom Streaming Protocol (`sonora-media://`)**:
   Instead of using insecure `file://` URLs or loading entire audio files into renderer memory, the main process registers `sonora-media://`. It streams audio directly from disk with support for HTTP `Range` requests (`HTTP 206 Partial Content`), enabling instant scrubbing in large uncompressed files.
2. **Web Audio DSP Pipeline**:
   The audio stream is routed through a modular Web Audio API graph:
   $$\text{HTMLAudioElement} \rightarrow \text{MediaElementSource} \rightarrow \text{Preamp Gain} \rightarrow 10 \times \text{BiquadFilterNodes} \rightarrow \text{Master Gain} \rightarrow \text{AnalyserNode} \rightarrow \text{Destination}$$
3. **Secure Context Isolation**:
   `nodeIntegration` is disabled and `contextIsolation` is enabled in the renderer window. All communication between the UI and native OS capabilities travels through typed IPC handlers exposed over `window.electronAPI`.
4. **Atomic JSON Persistence**:
   Application state and library metadata are saved using atomic write-and-rename operations (`.tmp` to `.json`) to prevent database corruption during sudden power loss or process termination.

---

## Privacy & Local-First Design

Sonora is built strictly as a local-first desktop application:

* **Local Music Files Only**: Your music files remain in their original folders on your local or external hard drives.
* **Zero Telemetry & Tracking**: Sonora makes no background network requests, contains no analytics SDKs, and collects zero telemetry.
* **No Account Required**: There is no login, registration, license server, or cloud service dependency.
* **Read-Only Audio Handling**: Sonora never modifies, renames, writes ID3 tags to, moves, or deletes your original audio files.
* **Isolated Application Cache**: Artwork images and index metadata are stored strictly in the standard Windows application data directory.

---

## Keyboard Shortcuts

Sonora includes an extensive keyboard shortcut system. Shortcuts automatically deactivate when typing in text fields to avoid input collisions.

### Default Shortcut Bindings

| Action | Default Key | Category | Scope |
| --- | --- | --- | --- |
| **Play / Pause** | `Space` | Playback | In-App |
| **Next Track** | `Ctrl + ArrowRight` | Playback | In-App |
| **Previous Track** | `Ctrl + ArrowLeft` | Playback | In-App |
| **Seek Forward (5s)** | `ArrowRight` | Playback | In-App |
| **Seek Backward (5s)** | `ArrowLeft` | Playback | In-App |
| **Increase Volume (+5%)** | `ArrowUp` | Playback | In-App |
| **Decrease Volume (-5%)** | `ArrowDown` | Playback | In-App |
| **Toggle Mute** | `M` | Playback | In-App |
| **Toggle Shuffle** | `S` | Playback | In-App |
| **Cycle Repeat Mode** | `R` | Playback | In-App |
| **Stop Playback** | `Ctrl + .` | Playback | In-App |
| **Favorite Playing Track** | `F` | Playback | In-App |
| **Focus Search** | `Ctrl + K` | Navigation | In-App |
| **Open All Songs** | `Ctrl + 1` | Navigation | In-App |
| **Open Albums** | `Ctrl + 2` | Navigation | In-App |
| **Open Artists** | `Ctrl + 3` | Navigation | In-App |
| **Open Genres** | `Ctrl + 4` | Navigation | In-App |
| **Open Playlists** | `Ctrl + 5` | Navigation | In-App |
| **Open Favorites** | `Ctrl + 6` | Navigation | In-App |
| **Open Recently Played** | `Ctrl + 7` | Navigation | In-App |
| **Open Settings** | `Ctrl + ,` | Navigation | In-App |
| **Navigate Back** | `Alt + ArrowLeft` | Navigation | In-App |
| **Navigate Forward** | `Alt + ArrowRight` | Navigation | In-App |
| **Toggle Queue Drawer** | `Ctrl + Q` | Queue | In-App |
| **Clear Queue** | *Unassigned by default* | Queue | In-App (Destructive) |
| **Toggle Equalizer** | `Ctrl + E` | General | In-App |
| **Create Playlist** | `Ctrl + N` | General | In-App |
| **Dismiss Modals & Menus** | `Escape` | General | In-App |

### Global Hardware Media Keys

Registered system-wide through Electron's `globalShortcut` module:

| Hardware Key | Command | Action |
| --- | --- | --- |
| `MediaPlayPause` | `play-pause` | Toggle play/pause |
| `MediaNextTrack` | `next-track` | Skip to next track in queue |
| `MediaPreviousTrack` | `previous-track` | Return to previous track or track start |
| `MediaStop` | `stop` | Stop playback |

### Hotkey Customization

Open **Settings $\rightarrow$ Keyboard Shortcuts** to:
* Reassign any shortcut by pressing your desired key combination in the recorder modal.
* Detect and resolve keybinding conflicts with immediate reassign prompts.
* Enable or disable individual shortcuts using dedicated toggles.
* Reset individual shortcuts or restore all bindings to default settings.

---

## Export Formats

Sonora can export any active collection (Library, Playlist, Queue, Favorites, History, Album, Artist, or Genre) through the **Export** menu or right-click context menu:

| Format | Extension | Output Description |
| --- | --- | --- |
| **HTML** | `.html` | Standalone webpage with collection summary, CSS styling, table view, and embedded base64 artwork |
| **PDF** | `.pdf` | Printable document rendered via Electron's headless PDF engine with running headers and page numbers |
| **CSV** | `.csv` | Standard RFC 4180 spreadsheet-compatible comma-separated track listing |
| **TSV** | `.tsv` | Tab-delimited plain text data for spreadsheets and database imports |
| **JSON** | `.json` | Structured JSON containing collection metadata, export timestamps, and full track properties |
| **M3U8** | `.m3u8` | Standard UTF-8 `#EXTM3U` playlist with `#EXTINF` duration/title tags and absolute audio file paths |
| **Markdown** | `.md` | Formatted GitHub-flavored markdown table with collection statistics |
| **Plain Text** | `.txt` | Clean, human-readable text document |

---

## Configuration & Data Storage

All persistent data is stored locally in standard OS application directories:

```
%APPDATA%/sonora-music-player/
├── data/
│   ├── library.json       # Monitored folders, track metadata index, playlists, favorites, history
│   └── settings.json      # Volume, mute, repeat, shuffle, speed, theme, accent, EQ bands, shortcuts, sleep timer
└── artwork-cache/         # Extracted album artwork indexed by MD5 hash (*.jpg, *.png)
```

* **Persistence Mechanism**: Writes are performed through atomic temporary file swaps (`.tmp` $\rightarrow$ `.json`) to prevent file corruption during power cuts or crashes.
* **Portability**: Deleting the `data/` directory completely resets the application to a fresh install state without affecting your original audio files.

---

## Installation

### Prerequisites

* **Operating System**: Windows 10 or Windows 11 (64-bit)
* **Node.js**: `v20.0.0` or higher (tested with Node.js `v22.x`)
* **npm**: `v10.0.0` or higher

### Steps

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

Start Sonora in development mode with Vite hot module replacement (HMR) and Electron live reloading:

```bash
npm run dev
```

### Type Checking

Run TypeScript strict type checking across the main process, preload script, and React renderer:

```bash
npm run typecheck
```

### Production Build Verification

Compile the TypeScript source and bundle the production Vite assets:

```bash
npm run build
```

Run the built application using Electron:

```bash
npm start
```

---

## Build & Release

Sonora uses **Electron Builder** to package standalone Windows distribution binaries.

To build the production distribution packages:

```bash
npm run package
```

The packaging process produces the following release artifacts inside the `release/` directory:

| Artifact | Type | Description |
| --- | --- | --- |
| `Sonora Setup 1.0.0.exe` | NSIS Installer | Full Windows installer with custom installation directory choice, Desktop shortcut, and Start Menu entry |
| `Sonora Portable 1.0.0.exe` | Portable Executable | Standalone executable requiring no installation |
| `win-unpacked/Sonora.exe` | Unpacked Binaries | Uncompressed application folder for testing and direct execution |

---

## Project Structure

```
sonora-music-player/
├── package.json               # Project manifest, dependencies, and electron-builder configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration with React, Tailwind, and Electron plugins
├── index.html                 # Renderer entry HTML
├── public/                    # Static assets
│   └── icon.png               # Application icon
├── release/                   # Packaged installer and portable binaries
├── scripts/                   # Development and test utility scripts
└── src/
    ├── main/                  # Electron main process
    │   ├── export/            # Native export manager and headless PDF generator
    │   ├── index.ts           # Main entry point and window lifecycle
    │   ├── ipc.ts             # IPC channel listeners and media shortcuts
    │   ├── protocol.ts        # Privileged custom audio streaming protocol
    │   ├── scanner.ts         # Asynchronous metadata and filesystem scanner
    │   ├── store.ts           # Atomic JSON disk persistence
    │   └── tray.ts            # Windows system tray integration
    ├── preload/               # Preload script
    │   └── index.ts           # Secure ContextBridge API definition
    ├── shared/                # Code shared across main and renderer
    │   ├── channels.ts        # IPC channel constants
    │   ├── types.ts           # Core data types and settings interfaces
    │   └── export/            # Export types, normalizers, and formatters
    └── renderer/              # React frontend application
        ├── audio/             # Web Audio API engine, graph nodes, and EQ presets
        ├── components/        # Layout, modals, views, visualizer, shortcuts, export
        ├── hooks/             # Custom React hooks (keyboard shortcuts)
        ├── stores/            # Zustand state stores
        ├── styles/            # CSS and Tailwind configurations
        ├── theme/             # Appearance modes and 16 accent color palettes
        └── utils/             # Formatters, key handling, and shortcut registry
```

---

## Screenshots

> *Screenshots will be added in upcoming documentation updates.*

---

## Contributing

Contributions to Sonora are welcome:

1. Fork the repository.
2. Create a topic branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Verify that type checks and builds pass without errors:
   ```bash
   npm run typecheck
   npm run build
   ```
4. Commit your changes with clear, descriptive commit messages.
5. Push to your branch and open a Pull Request.

---

## License

This project is licensed under the [MIT License](package.json).
