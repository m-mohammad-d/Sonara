import React, { useEffect, useState, useCallback } from "react";
import {
  Keyboard,
  X,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Ban,
} from "lucide-react";
import { eventToKeyCombo, isReservedCombo } from "../../utils/keyUtils";
import { ShortcutKeys } from "../common/ShortcutKeys";
import { useShortcutStore } from "@/renderer/stores/shortcutStore";

interface ShortcutRecorderModalProps {
  shortcutId: string | null;
  onClose: () => void;
}

export const ShortcutRecorderModal: React.FC<ShortcutRecorderModalProps> = ({
  shortcutId,
  onClose,
}) => {
  const { shortcuts, updateShortcut, replaceConflict, findConflict } =
    useShortcutStore();
  const shortcut = shortcutId ? shortcuts[shortcutId] : null;

  const [recordedCombo, setRecordedCombo] = useState<string | null>(
    shortcut?.keys ?? null,
  );
  const [isModifierOnly, setIsModifierOnly] = useState(false);

  useEffect(() => {
    if (shortcut) {
      setRecordedCombo(shortcut.keys);
      setIsModifierOnly(false);
    }
  }, [shortcut]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape without modifiers cancels/closes
      if (
        e.code === "Escape" &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !e.metaKey
      ) {
        onClose();
        return;
      }

      const { combo, isModifierOnly: modOnly } = eventToKeyCombo(e);
      if (!combo) return;

      setIsModifierOnly(modOnly);
      setRecordedCombo(combo);
    },
    [onClose],
  );

  useEffect(() => {
    if (!shortcut) return;

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [shortcut, handleKeyDown]);

  if (!shortcut) return null;

  const reservedInfo = !isModifierOnly
    ? isReservedCombo(recordedCombo)
    : { reserved: false };
  const conflictingShortcut =
    !isModifierOnly && !reservedInfo.reserved && recordedCombo
      ? findConflict(shortcut.id, recordedCombo)
      : null;

  const canSave =
    !isModifierOnly &&
    !reservedInfo.reserved &&
    !conflictingShortcut &&
    recordedCombo !== null &&
    recordedCombo.length > 0;

  const handleSave = () => {
    if (!canSave || !recordedCombo) return;
    updateShortcut(shortcut.id, recordedCombo);
    onClose();
  };

  const handleReplace = () => {
    if (!conflictingShortcut || !recordedCombo) return;
    replaceConflict(shortcut.id, conflictingShortcut.id, recordedCombo);
    onClose();
  };

  const handleUnassign = () => {
    updateShortcut(shortcut.id, null);
    onClose();
  };

  const handleResetToDefault = () => {
    if (shortcut.defaultKeys) {
      const conflict = findConflict(shortcut.id, shortcut.defaultKeys);
      if (conflict) {
        replaceConflict(shortcut.id, conflict.id, shortcut.defaultKeys);
      } else {
        updateShortcut(shortcut.id, shortcut.defaultKeys);
      }
    } else {
      updateShortcut(shortcut.id, null);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recorder-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 p-4 select-none"
    >
      <div
        className="w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl border border-border text-foreground flex flex-col gap-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-subtle text-accent-text border border-accent-border">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="recorder-modal-title"
                className="text-sm font-bold text-foreground"
              >
                Edit Shortcut: {shortcut.label}
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                {shortcut.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recording Visual Card */}
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-surface-input border-2 border-accent/60 shadow-inner gap-3 min-h-[140px] text-center relative overflow-hidden">
          <div className="absolute top-2 left-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-[10px] font-semibold text-accent-text uppercase tracking-wider">
              Listening for key combination
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center min-h-[36px]">
            {recordedCombo ? (
              <ShortcutKeys keys={recordedCombo} size="md" />
            ) : (
              <span className="text-xs text-foreground-subtle italic">
                Press any key combination
              </span>
            )}
          </div>

          <p className="text-[11px] text-foreground-muted">
            {isModifierOnly
              ? "Press another key to finish combination (e.g. K, Space, Arrow)"
              : "Press the new shortcut combination on your keyboard"}
          </p>
        </div>

        {/* Alerts: Reserved / Conflict */}
        {reservedInfo.reserved && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Reserved Shortcut</p>
              <p className="text-[11px] text-red-200/80 mt-0.5">
                This combination is reserved by{" "}
                {reservedInfo.reason?.toLowerCase() || "the system"} and cannot
                be assigned.
              </p>
            </div>
          </div>
        )}

        {conflictingShortcut && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start justify-between gap-3 text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">
                  Shortcut Conflict
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Already assigned to{" "}
                  <span className="font-semibold text-foreground">
                    {conflictingShortcut.label}
                  </span>
                  . Replacing will make the previous shortcut{" "}
                  <span className="italic">Unassigned</span>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReplace}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-black shrink-0 transition"
            >
              Replace
            </button>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUnassign}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition"
              title="Clear key combination"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Unassign</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition"
              title="Reset this shortcut to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Default</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-foreground-secondary hover:text-foreground bg-surface-hover hover:bg-surface-elevated border border-border-subtle transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-1.5 rounded-xl font-semibold bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent text-accent-fg transition shadow-sm shadow-accent-shadow"
            >
              Save Shortcut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
