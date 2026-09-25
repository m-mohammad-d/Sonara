import { create } from "zustand";
import type { SleepTimerMode } from "../../shared/types";
import { usePlayerStore } from "./playerStore";
import { useSettingsStore } from "./settingsStore";
import { useUIStore } from "./uiStore";

export interface SleepTimerState {
  mode: SleepTimerMode;
  targetTime: number | null;
  durationMinutes: number | null;
  remainingSeconds: number | null;

  setDurationTimer: (minutes: number) => void;
  setEndOfTrackTimer: () => void;
  clearTimer: () => void;
  initSleepTimer: () => void;
  handleTrackEnded: () => boolean;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;
let focusHandler: (() => void) | null = null;

const notifyCompletion = () => {
  useUIStore.getState().showToast("Sleep timer finished", "Playback has been paused.");

  const { notificationsEnabled } = useSettingsStore.getState();
  if (notificationsEnabled && window.electronAPI?.showNotification) {
    window.electronAPI.showNotification("Sleep timer finished", "Playback has been paused.");
  }
};

export const useSleepTimerStore = create<SleepTimerState>((set, get) => {
  const stopCountdown = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (visibilityHandler) {
      document.removeEventListener("visibilitychange", visibilityHandler);
      visibilityHandler = null;
    }
    if (focusHandler) {
      window.removeEventListener("focus", focusHandler);
      focusHandler = null;
    }
  };

  const triggerTimerCompletion = () => {
    stopCountdown();

    usePlayerStore.getState().pause();

    set({
      mode: "off",
      targetTime: null,
      durationMinutes: null,
      remainingSeconds: null,
    });

    window.electronAPI.saveSettings({
      sleepTimer: {
        mode: "off",
        targetTime: null,
        durationMinutes: null,
      },
    });

    notifyCompletion();
  };

  const checkTimer = () => {
    const { mode, targetTime, remainingSeconds } = get();
    if (mode !== "duration" || !targetTime) {
      stopCountdown();
      return;
    }

    const now = Date.now();
    if (now >= targetTime) {
      triggerTimerCompletion();
      return;
    }

    const derivedRemaining = Math.max(0, Math.ceil((targetTime - now) / 1000));
    if (derivedRemaining !== remainingSeconds) {
      set({ remainingSeconds: derivedRemaining });
    }
  };

  const startCountdown = () => {
    stopCountdown();

    checkTimer();

    timerInterval = setInterval(checkTimer, 500);

    visibilityHandler = () => {
      if (!document.hidden) {
        checkTimer();
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    focusHandler = () => {
      checkTimer();
    };
    window.addEventListener("focus", focusHandler);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", stopCountdown);
  }

  return {
    mode: "off",
    targetTime: null,
    durationMinutes: null,
    remainingSeconds: null,

    setDurationTimer: (minutes: number) => {
      stopCountdown();

      const validMinutes = Math.max(1, Math.min(720, Math.floor(minutes)));
      const targetTime = Date.now() + validMinutes * 60 * 1000;
      const remainingSeconds = validMinutes * 60;

      set({
        mode: "duration",
        targetTime,
        durationMinutes: validMinutes,
        remainingSeconds,
      });

      window.electronAPI.saveSettings({
        sleepTimer: {
          mode: "duration",
          targetTime,
          durationMinutes: validMinutes,
        },
      });

      startCountdown();
    },

    setEndOfTrackTimer: () => {
      stopCountdown();

      set({
        mode: "end-of-track",
        targetTime: null,
        durationMinutes: null,
        remainingSeconds: null,
      });

      // End of track is session-only and never restored after restart
      window.electronAPI.saveSettings({
        sleepTimer: {
          mode: "off",
          targetTime: null,
          durationMinutes: null,
        },
      });
    },

    clearTimer: () => {
      stopCountdown();

      set({
        mode: "off",
        targetTime: null,
        durationMinutes: null,
        remainingSeconds: null,
      });

      window.electronAPI.saveSettings({
        sleepTimer: {
          mode: "off",
          targetTime: null,
          durationMinutes: null,
        },
      });
    },

    initSleepTimer: () => {
      stopCountdown();

      const { sleepTimer } = useSettingsStore.getState();

      if (
        sleepTimer &&
        sleepTimer.mode === "duration" &&
        typeof sleepTimer.targetTime === "number"
      ) {
        const now = Date.now();
        if (sleepTimer.targetTime > now) {
          const derivedRemaining = Math.max(
            0,
            Math.ceil((sleepTimer.targetTime - now) / 1000),
          );

          set({
            mode: "duration",
            targetTime: sleepTimer.targetTime,
            durationMinutes:
              sleepTimer.durationMinutes ??
              Math.max(1, Math.round(derivedRemaining / 60)),
            remainingSeconds: derivedRemaining,
          });

          startCountdown();
          return;
        }
      }

      set({
        mode: "off",
        targetTime: null,
        durationMinutes: null,
        remainingSeconds: null,
      });

      window.electronAPI.saveSettings({
        sleepTimer: {
          mode: "off",
          targetTime: null,
          durationMinutes: null,
        },
      });
    },

    handleTrackEnded: () => {
      const { mode } = get();
      if (mode !== "end-of-track") {
        return false;
      }

      stopCountdown();

      usePlayerStore.getState().pause();

      set({
        mode: "off",
        targetTime: null,
        durationMinutes: null,
        remainingSeconds: null,
      });

      window.electronAPI.saveSettings({
        sleepTimer: {
          mode: "off",
          targetTime: null,
          durationMinutes: null,
        },
      });

      notifyCompletion();
      return true;
    },
  };
});
