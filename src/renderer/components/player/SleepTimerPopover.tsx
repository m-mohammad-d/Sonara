import React, { useState, useEffect, useRef } from "react";
import { Moon, Check, X, ArrowLeft, Clock } from "lucide-react";
import { useSleepTimerStore } from "../../stores/sleepTimerStore";
import { formatTime } from "../../utils/formatters";

interface SleepTimerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PRESET_OPTIONS = [
  { label: "15 minutes", minutes: 1 },
  { label: "30 minutes", minutes: 30 },
  { label: "45 minutes", minutes: 45 },
  { label: "60 minutes", minutes: 60 },
  { label: "90 minutes", minutes: 90 },
  { label: "120 minutes", minutes: 120 },
];

export const SleepTimerPopover: React.FC<SleepTimerPopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const {
    mode,
    durationMinutes,
    remainingSeconds,
    setDurationTimer,
    setEndOfTrackTimer,
    clearTimer,
  } = useSleepTimerStore();

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const isTimerActive = mode !== "off";

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, onClose, triggerRef]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  // Focus custom input when opened
  useEffect(() => {
    if (isCustomMode && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustomMode]);

  const handleSelectPreset = (minutes: number) => {
    setDurationTimer(minutes);
    onClose();
  };

  const handleSelectEndOfTrack = () => {
    setEndOfTrackTimer();
    onClose();
  };

  const handleCancelTimer = () => {
    clearTimer();
    onClose();
  };

  const handleStartCustomTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseInt(customInput.trim(), 10);

    if (isNaN(parsed) || !Number.isInteger(parsed)) {
      setCustomError("Please enter a valid number of minutes");
      return;
    }

    if (parsed < 1) {
      setCustomError("Duration must be at least 1 minute");
      return;
    }

    if (parsed > 720) {
      setCustomError("Duration cannot exceed 720 minutes (12 hours)");
      return;
    }

    setCustomError(null);
    setDurationTimer(parsed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Sleep timer settings"
      className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl glass-panel p-3 border border-border shadow-2xl flex flex-col gap-2.5 text-xs text-foreground z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          {isCustomMode ? (
            <button
              onClick={() => {
                setIsCustomMode(false);
                setCustomError(null);
              }}
              className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition"
              aria-label="Back to preset options"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Moon className="w-4 h-4 text-accent-text" />
          )}
          <span className="font-bold text-foreground">
            {isCustomMode ? "Custom Duration" : "Sleep Timer"}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close sleep timer menu"
          className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Timer Display & Cancel Button */}
      {isTimerActive && !isCustomMode && (
        <div className="p-2.5 rounded-xl bg-accent-subtle border border-accent-border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-accent-text uppercase tracking-wider">
              {mode === "duration" ? "Active Timer" : "End of Track"}
            </span>
            <span className="text-[11px] font-mono text-accent-text/80">
              {mode === "duration" && durationMinutes
                ? `${durationMinutes}m`
                : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {mode === "duration" ? (
              <span className="text-base font-bold font-mono text-foreground tracking-tight">
                {formatTime(remainingSeconds || 0)}{" "}
                <span className="text-xs font-normal text-foreground-muted">
                  remaining
                </span>
              </span>
            ) : (
              <span className="text-xs text-foreground font-medium">
                Stops after current track
              </span>
            )}

            <button
              onClick={handleCancelTimer}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content: Custom Duration Form or Presets List */}
      {isCustomMode ? (
        <form onSubmit={handleStartCustomTimer} className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="custom-minutes-input"
              className="text-[11px] font-medium text-foreground-secondary"
            >
              Stop playback after:
            </label>
            <div className="relative flex items-center">
              <input
                ref={customInputRef}
                id="custom-minutes-input"
                type="number"
                min={1}
                max={720}
                placeholder="e.g. 35"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setCustomError(null);
                }}
                className="w-full px-3 py-2 pr-16 rounded-xl bg-surface-input border border-border text-foreground text-xs focus:outline-none focus:border-accent transition"
              />
              <span className="absolute right-3 text-[11px] font-medium text-foreground-subtle pointer-events-none">
                minutes
              </span>
            </div>
            {customError && (
              <span className="text-[10px] text-red-400 mt-0.5">
                {customError}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                setCustomError(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated text-foreground-secondary transition border border-border-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-sm shadow-accent-shadow"
            >
              Start Timer
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-0.5">
          {/* Off Option */}
          <button
            onClick={handleCancelTimer}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition text-left ${
              !isTimerActive
                ? "bg-accent text-accent-fg font-medium"
                : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <span>Off</span>
            {!isTimerActive && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>

          {/* Presets */}
          {PRESET_OPTIONS.map(({ label, minutes }) => {
            const isSelected =
              mode === "duration" && durationMinutes === minutes;

            return (
              <button
                key={minutes}
                onClick={() => handleSelectPreset(minutes)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition text-left ${
                  isSelected
                    ? "bg-accent text-accent-fg font-medium"
                    : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            );
          })}

          {/* End of Current Track */}
          <button
            onClick={handleSelectEndOfTrack}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition text-left ${
              mode === "end-of-track"
                ? "bg-accent text-accent-fg font-medium"
                : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <span>End of current track</span>
            {mode === "end-of-track" && (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>

          {/* Custom Duration Button */}
          <div className="pt-1 mt-1 border-t border-border-subtle">
            <button
              onClick={() => {
                setCustomInput(
                  mode === "duration" && durationMinutes
                    ? durationMinutes.toString()
                    : "",
                );
                setIsCustomMode(true);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition text-left"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Custom...</span>
              </div>
              {mode === "duration" &&
                durationMinutes !== null &&
                !PRESET_OPTIONS.some((p) => p.minutes === durationMinutes) && (
                  <span className="text-[10px] text-accent-text font-mono">
                    {durationMinutes}m
                  </span>
                )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
