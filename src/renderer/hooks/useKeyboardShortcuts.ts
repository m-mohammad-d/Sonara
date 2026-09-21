import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      const { togglePlay, seek, currentTime, duration, nextTrack, prevTrack } = usePlayerStore.getState();
      const { volume, setVolume, toggleMute } = useSettingsStore.getState();
      const { closeContextMenu, toggleQueue, toggleEqualizer, toggleNewPlaylistModal, isQueueOpen, isEqualizerOpen, isNewPlaylistModalOpen, contextMenu } = useUIStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;

        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration, currentTime + 5));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'KeyN':
          e.preventDefault();
          nextTrack();
          break;

        case 'KeyP':
          e.preventDefault();
          prevTrack();
          break;

        case 'Escape':
          if (contextMenu) {
            closeContextMenu();
          } else if (isEqualizerOpen) {
            toggleEqualizer(false);
          } else if (isNewPlaylistModalOpen) {
            toggleNewPlaylistModal(false);
          } else if (isQueueOpen) {
            toggleQueue(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
