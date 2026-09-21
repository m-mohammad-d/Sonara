# Sonora Music Player

A complete, polished desktop music player built with Electron, React, TypeScript, Tailwind CSS, and the Web Audio API.

![Sonora Music Player](https://raw.githubusercontent.com/m-mohammad-d/Sonara/master/screenshot.png)

## Features

- **Audio Engine & Signal Processing**:
  - Web Audio API graph with HTML5 audio streaming.
  - **10-Band Graphic Equalizer** with center frequencies at 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, and 16kHz.
  - Presets: *Flat*, *Bass Boost*, *Treble Boost*, *Vocal*, *Rock*, *Pop*, *Classical*, *Electronic*, and *Custom*.
  - **Audio Visualizer**: 4 real-time visualizer modes (Continuous Spectrum, Oscilloscope Waveform, Bars, and Radial Circular). Automatically pauses when audio is idle to save CPU.
  - Playback speed adjustment (0.75x, 1x, 1.25x, 1.5x, 2x).

- **Library & Metadata**:
  - Recursive folder scanning for `.mp3`, `.flac`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.opus`, and `.wma`.
  - Automatic metadata extraction (Title, Artist, Album, Album Artist, Genre, Year, Track Number, Disc Number, Duration, Bitrate).
  - Embedded cover artwork extraction with local disk caching.
  - Custom streaming protocol (`sonora-media://`) with range requests (`HTTP 206 Partial Content`) for instant audio scrubbing.

- **Desktop Experience**:
  - Frameless modern dark UI with custom window controls and navigation history.
  - Dedicated views for All Songs, Albums, Artists, Genres, Favorites, and Recently Played.
  - Slide-over Playback Queue drawer with track reordering and removal.
  - Playlists management (create, rename, reorder, delete).
  - Desktop right-click context menus with viewport clamping.
  - Global keyboard shortcuts with input field avoidance (`Space`, `←`/`→`, `↑`/`↓`, `M`, `N`, `P`, `Esc`).
  - Atomic local JSON persistence (`app.getPath('userData')/data/`).

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / Pause |
| `←` / `→` | Seek 5 seconds backward / forward |
| `↑` / `↓` | Volume Up / Down (5%) |
| `M` | Mute / Unmute |
| `N` | Next track |
| `P` | Previous track |
| `Esc` | Dismiss modals, menus, and drawers |

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Package standalone Windows executable (Sonora.exe)
npm run package
```

## License

MIT
