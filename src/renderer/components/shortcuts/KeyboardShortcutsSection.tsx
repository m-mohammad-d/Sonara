import React, { useState, useMemo } from "react";
import {
  Keyboard,
  Search,
  X,
  RotateCcw,
  Radio,
  Music,
  ListMusic,
  Sliders,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import type { ShortcutCategory, ShortcutBinding } from "../../types/types";
import { ShortcutKeys } from "../common/ShortcutKeys";
import { ShortcutRecorderModal } from "./ShortcutRecorderModal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { useShortcutStore } from "@/renderer/stores/shortcutStore";

const CATEGORIES: ShortcutCategory[] = ["playback", "navigation", "queue", "general"];

const CATEGORY_INFO: Record<
  ShortcutCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  playback: { label: "Playback", icon: Music },
  navigation: { label: "Library & Navigation", icon: Radio },
  queue: { label: "Queue", icon: ListMusic },
  general: { label: "General", icon: Sliders },
};

export const KeyboardShortcutsSection: React.FC = () => {
  const {
    shortcuts,
    editingShortcutId,
    setEditingShortcutId,
    toggleShortcut,
    resetShortcut,
    resetAllShortcuts,
    isModified,
    destructivePendingShortcutId,
    setDestructivePendingShortcutId,
  } = useShortcutStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ShortcutCategory | "all"
  >("all");
  const [showResetAllModal, setShowResetAllModal] = useState(false);

  const shortcutList = useMemo<ShortcutBinding[]>(
    () => Object.values(shortcuts),
    [shortcuts],
  );

  const filteredShortcuts = useMemo<ShortcutBinding[]>(() => {
    return shortcutList.filter((s: ShortcutBinding) => {
      if (selectedCategory !== "all" && s.category !== selectedCategory) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const labelMatch = s.label.toLowerCase().includes(q);
      const descMatch = s.description.toLowerCase().includes(q);
      const catMatch = CATEGORY_INFO[s.category]?.label
        .toLowerCase()
        .includes(q);
      const keyMatch = s.keys
        ? s.keys.toLowerCase().includes(q)
        : "unassigned".includes(q);

      return labelMatch || descMatch || catMatch || keyMatch;
    });
  }, [shortcutList, selectedCategory, searchQuery]);

  const groupedShortcuts = useMemo(() => {
    const groups: Record<ShortcutCategory, ShortcutBinding[]> = {
      playback: [],
      navigation: [],
      queue: [],
      general: [],
    };
    for (const s of filteredShortcuts) {
      groups[s.category].push(s);
    }
    return groups;
  }, [filteredShortcuts]);

  const totalModifiedCount = useMemo(() => {
    return shortcutList.filter((s) => isModified(s.id)).length;
  }, [shortcutList, isModified]);

  const handleConfirmClearQueue = () => {
    usePlayerStore.getState().clearQueue();
    setDestructivePendingShortcutId(null);
  };

  return (
    <section className="glass-card p-5 rounded-2xl flex flex-col gap-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-subtle text-accent-text border border-accent-border">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Keyboard Shortcuts
              </h2>
              {totalModifiedCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text border border-accent-border">
                  {totalModifiedCount} customized
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted">
              Customize hotkeys for playback, navigation, and queue controls
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowResetAllModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground-secondary hover:text-foreground bg-surface-input hover:bg-surface-hover border border-border-subtle transition"
          title="Restore all shortcuts to Sonora defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Shortcuts</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-accent text-accent-fg shadow-sm shadow-accent-shadow"
                : "bg-surface-input text-foreground-muted hover:text-foreground hover:bg-surface-hover border border-border-subtle"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const info = CATEGORY_INFO[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                  isSelected
                    ? "bg-accent text-accent-fg shadow-sm shadow-accent-shadow"
                    : "bg-surface-input text-foreground-muted hover:text-foreground hover:bg-surface-hover border border-border-subtle"
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center min-w-[200px]">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-foreground-subtle pointer-events-none" />
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-7 rounded-xl bg-surface-input border border-border-subtle text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 p-0.5 text-foreground-subtle hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Shortcuts List */}
      {filteredShortcuts.length === 0 ? (
        <div className="py-8 text-center text-xs text-foreground-subtle rounded-xl bg-surface-input border border-border-subtle">
          No shortcuts matching &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((categoryKey) => {
            const items = groupedShortcuts[categoryKey];
              if (!items || items.length === 0) return null;

              const category = CATEGORY_INFO[categoryKey];
              const CategoryIcon = category.icon;

              return (
                <div key={categoryKey} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-1">
                    <CategoryIcon className="w-3.5 h-3.5 text-accent-text" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-subtle">
                      {category.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {items.map((s) => {
                      const modified = isModified(s.id);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            s.enabled
                              ? "bg-surface-input border-border-subtle hover:border-border hover:bg-surface-hover/80"
                              : "bg-surface-input/50 border-border-subtle/50 opacity-60"
                          }`}
                        >
                          {/* Left: Label & Description */}
                          <div className="flex items-center gap-2.5 min-w-0 pr-3">
                            {modified && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                                title="Customized from default"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    s.enabled
                                      ? "text-foreground"
                                      : "text-foreground-muted"
                                  }`}
                                >
                                  {s.label}
                                </span>
                                {s.scope === "global" && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-hover text-foreground-subtle border border-border-subtle font-mono">
                                    Global
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-foreground-muted truncate">
                                {s.description}
                              </p>
                            </div>
                          </div>

                          {/* Right: Key Badge & Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Key combination button */}
                            <button
                              type="button"
                              onClick={() => setEditingShortcutId(s.id)}
                              className="px-2 py-1 rounded-lg hover:bg-surface-elevated border border-transparent hover:border-border transition-colors group cursor-pointer"
                              title="Click to edit shortcut combination"
                            >
                              <ShortcutKeys keys={s.keys} />
                            </button>

                            {/* Individual Reset button (compact, visible when modified) */}
                            {modified && (
                              <button
                                type="button"
                                onClick={() => resetShortcut(s.id)}
                                className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-elevated rounded-lg transition"
                                title="Reset to default binding"
                                aria-label={`Reset ${s.label} to default`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Enable / Disable toggle switch */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={s.enabled}
                              aria-label={`Enable or disable ${s.label}`}
                              onClick={() => toggleShortcut(s.id)}
                              className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 focus:outline-none ${
                                s.enabled
                                  ? "bg-accent"
                                  : "bg-surface-hover border border-border"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  s.enabled
                                    ? "translate-x-3.5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Shortcut Recorder Modal */}
      {editingShortcutId && (
        <ShortcutRecorderModal
          shortcutId={editingShortcutId}
          onClose={() => setEditingShortcutId(null)}
        />
      )}

      {/* Confirmation: Reset All Shortcuts */}
      <ConfirmationModal
        isOpen={showResetAllModal}
        title="Reset all keyboard shortcuts?"
        description="All your custom shortcut configurations and bindings will be replaced with Sonora's original default shortcuts."
        confirmText="Reset All"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          resetAllShortcuts();
          setShowResetAllModal(false);
        }}
        onCancel={() => setShowResetAllModal(false)}
      />

      {/* Confirmation: Destructive Action (Clear Queue) */}
      <ConfirmationModal
        isOpen={destructivePendingShortcutId === "queue-clear"}
        title="Clear playback queue?"
        description="Are you sure you want to remove all upcoming tracks from the queue? This action cannot be undone."
        confirmText="Clear Queue"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmClearQueue}
        onCancel={() => setDestructivePendingShortcutId(null)}
      />
    </section>
  );
};
