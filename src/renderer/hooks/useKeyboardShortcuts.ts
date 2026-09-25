import { useEffect } from "react";
import { useUIStore } from "../stores/uiStore";
import { usePlayerStore } from "../stores/playerStore";
import { combosMatch, eventToKeyCombo } from "../utils/keyUtils";
import { useShortcutStore } from "../stores/shortcutStore";

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    // Load shortcuts from electron settings if not loaded yet
    if (!useShortcutStore.getState().isLoaded) {
      if (window.electronAPI?.getSettings) {
        window.electronAPI
          .getSettings()
          .then((settings) => {
            useShortcutStore.getState().initShortcuts(settings?.shortcuts);
          })
          .catch(() => {
            useShortcutStore.getState().initShortcuts();
          });
      } else {
        useShortcutStore.getState().initShortcuts();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        contextMenu,
        closeContextMenu,
        isEqualizerOpen,
        toggleEqualizer,
        isNewPlaylistModalOpen,
        toggleNewPlaylistModal,
        isQueueOpen,
        toggleQueue,
      } = useUIStore.getState();

      const {
        editingShortcutId,
        setEditingShortcutId,
        destructivePendingShortcutId,
        setDestructivePendingShortcutId,
        shortcuts,
        executeShortcut,
      } = useShortcutStore.getState();

      // 1. Context-aware Escape dismissal hierarchy
      if (
        e.code === "Escape" &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !e.metaKey
      ) {
        if (editingShortcutId) {
          e.preventDefault();
          setEditingShortcutId(null);
          return;
        }

        if (destructivePendingShortcutId) {
          e.preventDefault();
          setDestructivePendingShortcutId(null);
          return;
        }

        if (contextMenu) {
          e.preventDefault();
          closeContextMenu();
          return;
        }

        if (isEqualizerOpen) {
          e.preventDefault();
          toggleEqualizer(false);
          return;
        }

        if (isNewPlaylistModalOpen) {
          e.preventDefault();
          toggleNewPlaylistModal(false);
          return;
        }

        if (isQueueOpen) {
          e.preventDefault();
          toggleQueue(false);
          return;
        }

        // Blur active input/textarea if focused
        const activeEl = document.activeElement as HTMLElement | null;
        if (
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement ||
          activeEl?.isContentEditable
        ) {
          activeEl.blur();
          return;
        }

        return;
      }

      // If key recorder modal is open, let the recorder handle input
      if (editingShortcutId) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      const { combo, isModifierOnly } = eventToKeyCombo(e);
      if (isModifierOnly || !combo) {
        return;
      }

      // Find matching active shortcut
      const matched = Object.values(shortcuts).find(
        (s) => s.enabled && s.keys && combosMatch(s.keys, combo),
      );

      if (matched) {
        // Enforce input field safety: skip unless explicitly permitted
        if (isTyping && !matched.allowInInput) {
          return;
        }

        e.preventDefault();
        executeShortcut(matched.id);
        return;
      }

      // Preserve legacy single-key navigation (N for next track, P for previous track) if not typing
      if (!isTyping) {
        const hasCustomN = Object.values(shortcuts).some(
          (s) => s.enabled && combosMatch(s.keys, "N"),
        );
        const hasCustomP = Object.values(shortcuts).some(
          (s) => s.enabled && combosMatch(s.keys, "P"),
        );

        if (combo === "N" && !hasCustomN) {
          e.preventDefault();
          usePlayerStore.getState().nextTrack();
          return;
        }

        if (combo === "P" && !hasCustomP) {
          e.preventDefault();
          usePlayerStore.getState().prevTrack();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
