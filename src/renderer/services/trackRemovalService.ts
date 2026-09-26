import type { Track } from '../../shared/types';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Removes a track from Sonora's library, queues, playlists, and history,
 * ensuring no audio files on disk are touched and the removal persists across restarts and rescans.
 */
export async function removeTrackFromLibrary(track: Track): Promise<void> {
  if (!track || !track.id) return;

  const trackTitle = track.title || 'Track';

  // 1. Cleanly update player state and queue if track is playing or queued
  await usePlayerStore.getState().handleTrackRemoval(track.id);

  // 2. Remove from library store (updates library, albums, artists, genres and persists via IPC)
  await useLibraryStore.getState().removeTrackFromLibrary(track.id);

  // 3. Remove from playlists, favorites, and history
  usePlaylistStore.getState().handleTrackRemoved(track.id);

  // 4. Notify user with a subtle toast
  useUIStore.getState().showToast(
    'Removed from Library',
    `"${trackTitle}" was removed from your library.`,
  );
}

/**
 * Clears the entire Sonora library, playlists, favorites, history, and playback queue.
 * Does NOT delete any audio files from the user's disk.
 */
export async function clearLibraryWorkflow(): Promise<void> {
  // 1. Reset player and stop playback
  usePlayerStore.getState().resetPlayer();

  // 2. Clear playlists, favorites, and recent history
  usePlaylistStore.getState().clearAll();

  // 3. Clear library in store and backend
  await useLibraryStore.getState().clearLibrary();

  // 4. Notify user
  useUIStore.getState().showToast(
    'Library Cleared',
    'Your music library has been cleared. No files on disk were affected.',
  );
}
