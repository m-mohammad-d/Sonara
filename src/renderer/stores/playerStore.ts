import { create } from "zustand";
import type { Track } from "../../shared/types";
import { AudioEngine } from "../audio/engine";
import { useSettingsStore } from "./settingsStore";

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
  toggleShuffleQueue: (enabled: boolean) => void;
  clearError: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const engine = AudioEngine.getInstance();

  let hasRecordedPlay = false;

  const shuffleTracks = (tracks: Track[]): Track[] => {
    const result = [...tracks];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  };

  const createShuffledQueue = (
    queue: Track[],
    currentTrack: Track | null
  ): { queue: Track[]; index: number } => {
    if (!currentTrack) {
      return {
        queue: shuffleTracks(queue),
        index: 0,
      };
    }

    const currentIndex = queue.findIndex(
      (track) => track.id === currentTrack.id
    );

    if (currentIndex === -1) {
      return {
        queue: shuffleTracks(queue),
        index: 0,
      };
    }

    const beforeCurrent = queue.slice(0, currentIndex);
    const afterCurrent = queue.slice(currentIndex + 1);

    const shuffled = shuffleTracks([
      ...beforeCurrent,
      ...afterCurrent,
    ]);

    const currentPosition = Math.floor(
      Math.random() * (shuffled.length + 1)
    );

    shuffled.splice(currentPosition, 0, currentTrack);

    return {
      queue: shuffled,
      index: currentPosition,
    };
  };

  const advanceTrack = async (direction: "next" | "prev") => {
    const { queue, queueIndex } = get();
    const { repeatMode } = useSettingsStore.getState();

    if (queue.length === 0) return;

    let nextIndex =
      direction === "next"
        ? queueIndex + 1
        : queueIndex - 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        engine.pause();

        set({
          isPlaying: false,
          currentTime: 0,
        });

        return;
      }
    }

    if (nextIndex < 0) {
      if (repeatMode === "all") {
        nextIndex = queue.length - 1;
      } else {
        nextIndex = 0;
      }
    }

    const nextTrack = queue[nextIndex];

    if (!nextTrack) return;

    set({
      queueIndex: nextIndex,
    });

    await get().playTrack(nextTrack);
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
            set({
              currentTime: current,
              duration: dur || get().duration,
            });
          }

          if (!hasRecordedPlay && current > 15) {
            const track = get().currentTrack;

            if (track) {
              hasRecordedPlay = true;
              window.electronAPI.recordPlay(track.id);
            }
          }
        },

        onEnded: async () => {
          const { repeatMode } = useSettingsStore.getState();
          const { currentTrack } = get();

          if (repeatMode === "one" && currentTrack) {
            hasRecordedPlay = false;
            await engine.play(currentTrack.path, 0);
            return;
          }

          await advanceTrack("next");
        },

        onStateChange: (isPlaying) => {
          set({ isPlaying });
        },

        onError: (error) => {
          set({
            errorMessage: error,
            isPlaying: false,
          });
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
          const result = createShuffledQueue(
            newQueue,
            track
          );

          updatedQueue = result.queue;
          nextIndex = result.index;
        } else {
          updatedQueue = [...newQueue];

          nextIndex = updatedQueue.findIndex(
            (item) => item.id === track.id
          );

          if (nextIndex === -1) {
            nextIndex = 0;
          }
        }
      } else {
        const existingIndex = updatedQueue.findIndex(
          (item) => item.id === track.id
        );

        if (existingIndex !== -1) {
          nextIndex = existingIndex;
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

      const { notificationsEnabled } =
        useSettingsStore.getState();

      if (notificationsEnabled) {
        await window.electronAPI.showNotification(
          track.title,
          track.artist
        );
      }

      window.electronAPI.saveSettings({
        lastTrackId: track.id,
      });
    },

    togglePlay: async () => {
      const {
        currentTrack,
        isPlaying,
        queue,
      } = get();

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
      await advanceTrack("next");
    },

    prevTrack: async () => {
      if (get().currentTime > 3) {
        engine.seek(0);

        set({
          currentTime: 0,
        });

        return;
      }

      await advanceTrack("prev");
    },

    seek: (seconds: number) => {
      set({
        currentTime: seconds,
      });

      engine.seek(seconds);
    },

    setSeeking: (isSeeking: boolean) => {
      set({
        isSeeking,
      });
    },

    addToQueue: (tracks: Track | Track[]) => {
      const toAdd = Array.isArray(tracks)
        ? tracks
        : [tracks];

      const {
        queue,
        originalQueue,
      } = get();

      set({
        queue: [...queue, ...toAdd],
        originalQueue: [
          ...originalQueue,
          ...toAdd,
        ],
      });
    },

    playNext: (track: Track) => {
      const { queue, queueIndex } = get();

      const insertAt = queueIndex + 1;
      const newQueue = [...queue];

      newQueue.splice(insertAt, 0, track);

      set({
        queue: newQueue,
      });
    },

    removeFromQueue: (index: number) => {
      const {
        queue,
        queueIndex,
      } = get();

      if (index < 0 || index >= queue.length) {
        return;
      }

      const newQueue = queue.filter(
        (_, idx) => idx !== index
      );

      let newIndex = queueIndex;

      if (index < queueIndex) {
        newIndex = queueIndex - 1;
      } else if (index === queueIndex) {
        newIndex = Math.min(
          queueIndex,
          newQueue.length - 1
        );
      }

      set({
        queue: newQueue,
        queueIndex: newIndex,
      });
    },

    reorderQueue: (
      fromIndex: number,
      toIndex: number
    ) => {
      const {
        queue,
        queueIndex,
      } = get();

      if (
        fromIndex < 0 ||
        fromIndex >= queue.length ||
        toIndex < 0 ||
        toIndex >= queue.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const newQueue = [...queue];
      const [moved] = newQueue.splice(
        fromIndex,
        1
      );

      if (!moved) return;

      newQueue.splice(
        toIndex,
        0,
        moved
      );

      let newIndex = queueIndex;

      if (queueIndex === fromIndex) {
        newIndex = toIndex;
      } else if (
        fromIndex < queueIndex &&
        toIndex >= queueIndex
      ) {
        newIndex--;
      } else if (
        fromIndex > queueIndex &&
        toIndex <= queueIndex
      ) {
        newIndex++;
      }

      set({
        queue: newQueue,
        queueIndex: newIndex,
      });
    },

    clearQueue: () => {
      const { currentTrack } = get();

      if (currentTrack) {
        set({
          queue: [currentTrack],
          queueIndex: 0,
        });
      } else {
        set({
          queue: [],
          queueIndex: -1,
        });
      }
    },

    toggleShuffleQueue: (enabled: boolean) => {
      const {
        queue,
        originalQueue,
        currentTrack,
      } = get();

      if (queue.length <= 1) return;

      if (enabled) {
        const result = createShuffledQueue(
          queue,
          currentTrack
        );

        set({
          queue: result.queue,
          queueIndex: result.index,
        });

        return;
      }

      const restoredQueue = [...originalQueue];

      const restoredIndex = currentTrack
        ? restoredQueue.findIndex(
            (track) => track.id === currentTrack.id
          )
        : -1;

      set({
        queue: restoredQueue,
        queueIndex:
          restoredIndex >= 0
            ? restoredIndex
            : 0,
      });
    },

    clearError: () => {
      set({
        errorMessage: null,
      });
    },
  };
});
