import type { ShortcutBinding } from "../types/types";
import { usePlayerStore } from "../stores/playerStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useUIStore } from "../stores/uiStore";
import { usePlaylistStore } from "../stores/playlistStore";

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  // Playback
  {
    id: "playback-play-pause",
    category: "playback",
    label: "Play / Pause",
    description: "Start or pause audio playback",
    defaultKeys: "Space",
    keys: "Space",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-next-track",
    category: "playback",
    label: "Next Track",
    description: "Skip to the next track in queue",
    defaultKeys: "Ctrl+ArrowRight",
    keys: "Ctrl+ArrowRight",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-prev-track",
    category: "playback",
    label: "Previous Track",
    description: "Return to previous track or start of current track",
    defaultKeys: "Ctrl+ArrowLeft",
    keys: "Ctrl+ArrowLeft",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-seek-forward",
    category: "playback",
    label: "Seek Forward",
    description: "Fast forward 5 seconds",
    defaultKeys: "ArrowRight",
    keys: "ArrowRight",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-seek-backward",
    category: "playback",
    label: "Seek Backward",
    description: "Rewind 5 seconds",
    defaultKeys: "ArrowLeft",
    keys: "ArrowLeft",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-volume-up",
    category: "playback",
    label: "Increase Volume",
    description: "Raise playback volume by 5%",
    defaultKeys: "ArrowUp",
    keys: "ArrowUp",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-volume-down",
    category: "playback",
    label: "Decrease Volume",
    description: "Lower playback volume by 5%",
    defaultKeys: "ArrowDown",
    keys: "ArrowDown",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-toggle-mute",
    category: "playback",
    label: "Toggle Mute",
    description: "Mute or restore audio volume",
    defaultKeys: "M",
    keys: "M",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-toggle-shuffle",
    category: "playback",
    label: "Toggle Shuffle",
    description: "Turn shuffle on or off for the upcoming queue",
    defaultKeys: "S",
    keys: "S",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-cycle-repeat",
    category: "playback",
    label: "Cycle Repeat Mode",
    description: "Cycle between repeat off, repeat all, and repeat one",
    defaultKeys: "R",
    keys: "R",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-stop",
    category: "playback",
    label: "Stop Playback",
    description: "Pause audio and reset position to beginning",
    defaultKeys: "Ctrl+.",
    keys: "Ctrl+.",
    scope: "app",
    enabled: true,
  },
  {
    id: "playback-toggle-favorite",
    category: "playback",
    label: "Favorite Playing Track",
    description: "Add or remove the currently playing song from Favorites",
    defaultKeys: "F",
    keys: "F",
    scope: "app",
    enabled: true,
  },

  // Library & Navigation
  {
    id: "nav-focus-search",
    category: "navigation",
    label: "Focus Search",
    description: "Quickly jump to and highlight the search bar",
    defaultKeys: "Ctrl+K",
    keys: "Ctrl+K",
    scope: "app",
    enabled: true,
    allowInInput: true,
  },
  {
    id: "nav-all-songs",
    category: "navigation",
    label: "Open All Songs",
    description: "Navigate to Songs library view",
    defaultKeys: "Ctrl+1",
    keys: "Ctrl+1",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-albums",
    category: "navigation",
    label: "Open Albums",
    description: "Navigate to Albums collection",
    defaultKeys: "Ctrl+2",
    keys: "Ctrl+2",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-artists",
    category: "navigation",
    label: "Open Artists",
    description: "Navigate to Artists collection",
    defaultKeys: "Ctrl+3",
    keys: "Ctrl+3",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-genres",
    category: "navigation",
    label: "Open Genres",
    description: "Navigate to Genres collection",
    defaultKeys: "Ctrl+4",
    keys: "Ctrl+4",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-playlists",
    category: "navigation",
    label: "Open Playlists",
    description: "Navigate to Playlists overview",
    defaultKeys: "Ctrl+5",
    keys: "Ctrl+5",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-favorites",
    category: "navigation",
    label: "Open Favorites",
    description: "Navigate to Favorited tracks",
    defaultKeys: "Ctrl+6",
    keys: "Ctrl+6",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-recent",
    category: "navigation",
    label: "Open Recently Played",
    description: "Navigate to listening history",
    defaultKeys: "Ctrl+7",
    keys: "Ctrl+7",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-settings",
    category: "navigation",
    label: "Open Settings",
    description: "Open application settings and preferences",
    defaultKeys: "Ctrl+,",
    keys: "Ctrl+,",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-back",
    category: "navigation",
    label: "Navigate Back",
    description: "Go back to previous page in history",
    defaultKeys: "Alt+ArrowLeft",
    keys: "Alt+ArrowLeft",
    scope: "app",
    enabled: true,
  },
  {
    id: "nav-forward",
    category: "navigation",
    label: "Navigate Forward",
    description: "Go forward to next page in history",
    defaultKeys: "Alt+ArrowRight",
    keys: "Alt+ArrowRight",
    scope: "app",
    enabled: true,
  },

  // Queue
  {
    id: "queue-toggle",
    category: "queue",
    label: "Toggle Queue",
    description: "Open or close the upcoming playback queue drawer",
    defaultKeys: "Ctrl+Q",
    keys: "Ctrl+Q",
    scope: "app",
    enabled: true,
  },
  {
    id: "queue-clear",
    category: "queue",
    label: "Clear Queue",
    description:
      "Remove all songs from the playback queue (requires confirmation)",
    defaultKeys: null,
    keys: null,
    scope: "app",
    enabled: true,
    isDestructive: true,
  },

  // General
  {
    id: "general-toggle-eq",
    category: "general",
    label: "Toggle Equalizer",
    description: "Open or close the 10-band audio equalizer dialog",
    defaultKeys: "Ctrl+E",
    keys: "Ctrl+E",
    scope: "app",
    enabled: true,
  },
  {
    id: "general-new-playlist",
    category: "general",
    label: "Create Playlist",
    description: "Open dialog to create a new music playlist",
    defaultKeys: "Ctrl+N",
    keys: "Ctrl+N",
    scope: "app",
    enabled: true,
  },
];

export function executeShortcutAction(id: string): void {
  switch (id) {
    case "playback-play-pause":
      usePlayerStore.getState().togglePlay();
      break;

    case "playback-next-track":
      usePlayerStore.getState().nextTrack();
      break;

    case "playback-prev-track":
      usePlayerStore.getState().prevTrack();
      break;

    case "playback-seek-forward": {
      const { currentTime, duration, seek } = usePlayerStore.getState();
      seek(Math.min(duration, currentTime + 5));
      break;
    }

    case "playback-seek-backward": {
      const { currentTime, seek } = usePlayerStore.getState();
      seek(Math.max(0, currentTime - 5));
      break;
    }

    case "playback-volume-up": {
      const { volume, setVolume } = useSettingsStore.getState();
      setVolume(Math.min(1, volume + 0.05));
      break;
    }

    case "playback-volume-down": {
      const { volume, setVolume } = useSettingsStore.getState();
      setVolume(Math.max(0, volume - 0.05));
      break;
    }

    case "playback-toggle-mute":
      useSettingsStore.getState().toggleMute();
      break;

    case "playback-toggle-shuffle":
      useSettingsStore.getState().toggleShuffle();
      break;

    case "playback-cycle-repeat": {
      const { repeatMode, setRepeatMode } = useSettingsStore.getState();
      if (repeatMode === "off") setRepeatMode("all");
      else if (repeatMode === "all") setRepeatMode("one");
      else setRepeatMode("off");
      break;
    }

    case "playback-stop": {
      const { pause, seek } = usePlayerStore.getState();
      pause();
      seek(0);
      break;
    }

    case "playback-toggle-favorite": {
      const { currentTrack } = usePlayerStore.getState();
      if (currentTrack) {
        usePlaylistStore.getState().toggleFavorite(currentTrack.id);
      }
      break;
    }

    case "nav-focus-search": {
      const searchInput = document.getElementById(
        "sonora-search-input",
      ) as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      break;
    }

    case "nav-all-songs":
      useUIStore.getState().navigate("tracks");
      break;

    case "nav-albums":
      useUIStore.getState().navigate("albums");
      break;

    case "nav-artists":
      useUIStore.getState().navigate("artists");
      break;

    case "nav-genres":
      useUIStore.getState().navigate("genres");
      break;

    case "nav-playlists":
      useUIStore.getState().navigate("playlists");
      break;

    case "nav-favorites":
      useUIStore.getState().navigate("favorites");
      break;

    case "nav-recent":
      useUIStore.getState().navigate("recent");
      break;

    case "nav-settings":
      useUIStore.getState().navigate("settings");
      break;

    case "nav-back":
      useUIStore.getState().goBack();
      break;

    case "nav-forward":
      useUIStore.getState().goForward();
      break;

    case "queue-toggle":
      useUIStore.getState().toggleQueue();
      break;

    case "general-toggle-eq":
      useUIStore.getState().toggleEqualizer();
      break;

    case "general-new-playlist":
      useUIStore.getState().toggleNewPlaylistModal(true);
      break;
  }
}
