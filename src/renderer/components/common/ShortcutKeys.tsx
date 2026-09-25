import React from "react";
import { formatKeyForDisplay, splitKeyCombo } from "../../utils/keyUtils";

interface ShortcutKeysProps {
  keys: string | null;
  className?: string;
  size?: "sm" | "md";
}

export const ShortcutKeys: React.FC<ShortcutKeysProps> = ({
  keys,
  className = "",
  size = "sm",
}) => {
  if (!keys) {
    return (
      <span className="text-[11px] italic text-foreground-subtle select-none">
        Unassigned
      </span>
    );
  }

  const parts = splitKeyCombo(keys);

  const kbdPadding =
    size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";

  return (
    <div
      className={`inline-flex items-center gap-1 select-none font-mono ${className}`}
    >
      {parts.map((part, index) => {
        const { label } = formatKeyForDisplay(part);
        return (
          <React.Fragment key={`${part}-${index}`}>
            {index > 0 && (
              <span className="text-foreground-subtle text-[10px] font-sans font-medium px-0.5">
                +
              </span>
            )}
            <kbd
              className={`${kbdPadding} rounded-md bg-surface-hover text-foreground font-semibold border border-border/80 shadow-xs inline-flex items-center justify-center min-w-[20px] transition-colors`}
            >
              {label}
            </kbd>
          </React.Fragment>
        );
      })}
    </div>
  );
};
