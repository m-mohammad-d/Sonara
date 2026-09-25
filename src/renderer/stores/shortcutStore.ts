import { create } from "zustand";
import type { ShortcutBinding, UserShortcutOverrides } from "../types/types";
import {
  DEFAULT_SHORTCUTS,
  executeShortcutAction,
} from "../utils/shortcutRegistry";
import { combosMatch, normalizeKeyCombo } from "../utils/keyUtils";

interface ShortcutState {
  shortcuts: Record<string, ShortcutBinding>;
  isLoaded: boolean;
  editingShortcutId: string | null;
  destructivePendingShortcutId: string | null;

  initShortcuts: (savedOverrides?: UserShortcutOverrides) => Promise<void>;
  updateShortcut: (id: string, keys: string | null) => void;
  replaceConflict: (
    newId: string,
    conflictId: string,
    keys: string | null,
  ) => void;
  toggleShortcut: (id: string, enabled?: boolean) => void;
  resetShortcut: (id: string) => void;
  resetAllShortcuts: () => void;
  findConflict: (id: string, keys: string | null) => ShortcutBinding | null;
  isModified: (id: string) => boolean;
  setEditingShortcutId: (id: string | null) => void;
  setDestructivePendingShortcutId: (id: string | null) => void;
  executeShortcut: (id: string) => void;
}

function computeOverrides(
  shortcuts: Record<string, ShortcutBinding>,
): UserShortcutOverrides {
  const overrides: UserShortcutOverrides = {};
  for (const s of Object.values(shortcuts)) {
    if (s.keys !== s.defaultKeys || !s.enabled) {
      overrides[s.id] = {
        keys: s.keys,
        enabled: s.enabled,
      };
    }
  }
  return overrides;
}

function saveToSettings(shortcuts: Record<string, ShortcutBinding>): void {
  const overrides = computeOverrides(shortcuts);
  if (window.electronAPI?.saveSettings) {
    window.electronAPI.saveSettings({ shortcuts: overrides });
  }
}

export const useShortcutStore = create<ShortcutState>((set, get) => {
  const initialMap: Record<string, ShortcutBinding> = {};
  for (const item of DEFAULT_SHORTCUTS) {
    initialMap[item.id] = { ...item };
  }

  return {
    shortcuts: initialMap,
    isLoaded: false,
    editingShortcutId: null,
    destructivePendingShortcutId: null,

    initShortcuts: async (savedOverrides) => {
      let overrides = savedOverrides;

      // Single source of truth: fallback to localStorage only if settings.json has no shortcuts
      if (!overrides || Object.keys(overrides).length === 0) {
        try {
          const raw = localStorage.getItem("sonora_keyboard_shortcuts");
          if (raw) {
            overrides = JSON.parse(raw);
            // Migrate once into settings.json
            if (
              overrides &&
              Object.keys(overrides).length > 0 &&
              window.electronAPI?.saveSettings
            ) {
              window.electronAPI.saveSettings({ shortcuts: overrides });
            }
          }
        } catch {
          // Ignore invalid localStorage content
        }
      }

      const mergedMap: Record<string, ShortcutBinding> = {};
      for (const def of DEFAULT_SHORTCUTS) {
        mergedMap[def.id] = { ...def };
      }

      if (overrides && typeof overrides === "object") {
        for (const [id, val] of Object.entries(overrides)) {
          if (!mergedMap[id]) continue; // Ignore obsolete IDs

          if (val === null) {
            mergedMap[id].keys = null;
          } else if (typeof val === "string") {
            mergedMap[id].keys = normalizeKeyCombo(val);
          } else if (typeof val === "object" && val !== null) {
            const config = val as { keys?: string | null; enabled?: boolean };
            if ("keys" in config && config.keys !== undefined) {
              mergedMap[id].keys =
                config.keys !== null ? normalizeKeyCombo(config.keys) : null;
            }
            if (typeof config.enabled === "boolean") {
              mergedMap[id].enabled = config.enabled;
            }
          }
        }
      }

      set({ shortcuts: mergedMap, isLoaded: true });
    },

    updateShortcut: (id, keys) => {
      const { shortcuts } = get();
      const current = shortcuts[id];
      if (!current) return;

      const normalized = keys ? normalizeKeyCombo(keys) : null;
      const updated = {
        ...shortcuts,
        [id]: {
          ...current,
          keys: normalized,
        },
      };

      set({ shortcuts: updated, editingShortcutId: null });
      saveToSettings(updated);
    },

    replaceConflict: (newId, conflictId, keys) => {
      const { shortcuts } = get();
      const newShortcut = shortcuts[newId];
      const conflictShortcut = shortcuts[conflictId];
      if (!newShortcut || !conflictShortcut) return;

      const normalized = keys ? normalizeKeyCombo(keys) : null;
      const updated = {
        ...shortcuts,
        [newId]: {
          ...newShortcut,
          keys: normalized,
        },
        [conflictId]: {
          ...conflictShortcut,
          keys: null, // Previous shortcut becomes Unassigned
        },
      };

      set({ shortcuts: updated, editingShortcutId: null });
      saveToSettings(updated);
    },

    toggleShortcut: (id, enabled) => {
      const { shortcuts } = get();
      const current = shortcuts[id];
      if (!current) return;

      const nextEnabled = enabled !== undefined ? enabled : !current.enabled;
      const updated = {
        ...shortcuts,
        [id]: {
          ...current,
          enabled: nextEnabled,
        },
      };

      set({ shortcuts: updated });
      saveToSettings(updated);
    },

    resetShortcut: (id) => {
      const { shortcuts } = get();
      const current = shortcuts[id];
      if (!current) return;

      const updated = {
        ...shortcuts,
        [id]: {
          ...current,
          keys: current.defaultKeys,
          enabled: true,
        },
      };

      set({ shortcuts: updated });
      saveToSettings(updated);
    },

    resetAllShortcuts: () => {
      const resetMap: Record<string, ShortcutBinding> = {};
      for (const def of DEFAULT_SHORTCUTS) {
        resetMap[def.id] = { ...def };
      }

      set({ shortcuts: resetMap });
      if (window.electronAPI?.saveSettings) {
        window.electronAPI.saveSettings({ shortcuts: {} });
      }
      try {
        localStorage.removeItem("sonora_keyboard_shortcuts");
      } catch {
        // Ignore storage error
      }
    },

    findConflict: (id, keys) => {
      if (!keys) return null;
      const { shortcuts } = get();
      for (const item of Object.values(shortcuts)) {
        if (item.id === id) continue;
        if (!item.enabled) continue;
        if (combosMatch(item.keys, keys)) {
          return item;
        }
      }
      return null;
    },

    isModified: (id) => {
      const { shortcuts } = get();
      const item = shortcuts[id];
      if (!item) return false;
      return item.keys !== item.defaultKeys || !item.enabled;
    },

    setEditingShortcutId: (id) => {
      set({ editingShortcutId: id });
    },

    setDestructivePendingShortcutId: (id) => {
      set({ destructivePendingShortcutId: id });
    },

    executeShortcut: (id) => {
      const { shortcuts } = get();
      const item = shortcuts[id];
      if (!item || !item.enabled || !item.keys) return;

      if (item.isDestructive) {
        set({ destructivePendingShortcutId: id });
      } else {
        executeShortcutAction(id);
      }
    },
  };
});
