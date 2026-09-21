import { create } from 'zustand';
import type { Track } from '../../shared/types';
import { AudioEngine } from '../audio/engine';
import { useSettingsStore } from './settingsStore';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Track[];
  originalQueue: Track[];
  queueIndex: number;
  isSeeking: boolean;
  errorMessage: string | null;

  initPlayer: () => void;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => void;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seek: (seconds: number) => void;
  setSeeking: (seeking: boolean) => void;
  addToQueue: (tracks: Track | Track[]) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  clearError: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const engine = AudioEngine.getInstance();
  let hasRecordedPlay = false;

  const advanceTrack = async (direction: 'next' | 'prev') => {
    const { queue, queueIndex } = get();
    const { repeatMode } = useSettingsStore.getState();

    if (queue.length === 0) return;

    let nextIndex = direction === 'next' ? queueIndex + 1 : queueIndex - 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // End of queue in repeat 'off'
        engine.pause();
        set({ isPlaying: false, currentTime: 0 });
        return;
      }
    } else if (nextIndex < 0) {
      nextIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({ queueIndex: nextIndex });
      await get().playTrack(nextTrack);
    }
  };

  return {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    queue: [],
    originalQueue: [],
    queueIndex: -1,
    isSeeking: false,
    errorMessage: null,

    initPlayer: () => {
      engine.setListener({
        onTimeUpdate: (current, dur) => {
          if (!get().isSeeking) {
            set({ currentTime: current, duration: dur || get().duration });
          }

          // Record play after 15s of playback
          if (!hasRecordedPlay && current > 15) {
            const tr = get().currentTrack;
            if (tr) {
              hasRecordedPlay = true;
              window.electronAPI.recordPlay(tr.id);
            }
          }
        },

        onEnded: async () => {
          const { repeatMode } = useSettingsStore.getState();
          const { currentTrack } = get();

          if (repeatMode === 'one' && currentTrack) {
            await engine.play(currentTrack.path, 0);
          } else {
            await advanceTrack('next');
          }
        },

        onStateChange: (isPlaying) => {
          set({ isPlaying });
        },

        onError: (error) => {
          set({ errorMessage: error, isPlaying: false });
        },
      });
    },

    playTrack: async (track: Track, newQueue?: Track[]) => {
      hasRecordedPlay = false;
      const { shuffle } = useSettingsStore.getState();

      let updatedQueue = get().queue;
      let updatedOriginal = get().originalQueue;
      let nextIndex = 0;

      if (newQueue && newQueue.length > 0) {
        updatedOriginal = [...newQueue];
        if (shuffle) {
          // Shuffle other tracks while keeping selected track first
          const others = newQueue.filter((t) => t.id !== track.id);
          for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
          }
          updatedQueue = [track, ...others];
          nextIndex = 0;
        } else {
          updatedQueue = [...newQueue];
          nextIndex = updatedQueue.findIndex((t) => t.id === track.id);
          if (nextIndex === -1) nextIndex = 0;
        }
      } else {
        // Track played from existing queue or single play
        const existingIdx = updatedQueue.findIndex((t) => t.id === track.id);
        if (existingIdx !== -1) {
          nextIndex = existingIdx;
        } else {
          updatedQueue = [track, ...updatedQueue];
          updatedOriginal = [track, ...updatedOriginal];
          nextIndex = 0;
        }
      }

      set({
        currentTrack: track,
        queue: updatedQueue,
        originalQueue: updatedOriginal,
        queueIndex: nextIndex,
        currentTime: 0,
        duration: track.duration || 0,
        errorMessage: null,
      });

      await engine.play(track.path, 0);

      // Persist last played track
      window.electronAPI.saveSettings({
        lastTrackId: track.id,
      });
    },

    togglePlay: async () => {
      const { currentTrack, isPlaying, queue } = get();
      if (!currentTrack) {
        if (queue.length > 0) {
          await get().playTrack(queue[0]);
        }
        return;
      }

      if (isPlaying) {
        engine.pause();
      } else {
        await engine.play();
      }
    },

    pause: () => {
      engine.pause();
    },

    nextTrack: async () => {
      await advanceTrack('next');
    },

    prevTrack: async () => {
      // If played more than 3 seconds, restart current track
      if (get().currentTime > 3) {
        engine.seek(0);
        set({ currentTime: 0 });
        return;
      }
      await advanceTrack('prev');
    },

    seek: (seconds: number) => {
      set({ currentTime: seconds });
      engine.seek(seconds);
    },

    setSeeking: (isSeeking: boolean) => {
      set({ isSeeking });
    },

    addToQueue: (tracks: Track | Track[]) => {
      const toAdd = Array.isArray(tracks) ? tracks : [tracks];
      const { queue, originalQueue } = get();
      set({
        queue: [...queue, ...toAdd],
        originalQueue: [...originalQueue, ...toAdd],
      });
    },

    playNext: (track: Track) => {
      const { queue, queueIndex } = get();
      const insertAt = queueIndex + 1;
      const newQueue = [...queue];
      newQueue.splice(insertAt, 0, track);
      set({ queue: newQueue });
    },

    removeFromQueue: (index: number) => {
      const { queue, queueIndex } = get();
      const newQueue = queue.filter((_, idx) => idx !== index);
      let newIdx = queueIndex;
      if (index < queueIndex) {
        newIdx = queueIndex - 1;
      } else if (index === queueIndex) {
        newIdx = Math.min(newIdx, newQueue.length - 1);
      }
      set({ queue: newQueue, queueIndex: newIdx });
    },

    reorderQueue: (fromIndex: number, toIndex: number) => {
      const { queue, queueIndex } = get();
      if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) return;

      const newQueue = [...queue];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);

      let newIdx = queueIndex;
      if (queueIndex === fromIndex) {
        newIdx = toIndex;
      } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
        newIdx--;
      } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
        newIdx++;
      }

      set({ queue: newQueue, queueIndex: newIdx });
    },

    clearQueue: () => {
      const { currentTrack } = get();
      if (currentTrack) {
        set({ queue: [currentTrack], queueIndex: 0 });
      } else {
        set({ queue: [], queueIndex: -1 });
      }
    },

    clearError: () => {
      set({ errorMessage: null });
    },
  };
});
