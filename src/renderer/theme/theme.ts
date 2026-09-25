import type { ThemeMode, AccentColor } from "../../shared/types";

export type { ThemeMode, AccentColor };

export interface AccentPresetMeta {
  id: AccentColor;
  label: string;
  previewHex: string;
}

export interface ThemeModeMeta {
  id: ThemeMode;
  label: string;
  description: string;
}

export const ACCENT_PRESETS: Record<AccentColor, AccentPresetMeta> = {
  blue: {
    id: "blue",
    label: "Blue",
    previewHex: "#3b82f6",
  },
  sky: {
    id: "sky",
    label: "Sky",
    previewHex: "#0ea5e9",
  },
  cyan: {
    id: "cyan",
    label: "Cyan",
    previewHex: "#06b6d4",
  },
  teal: {
    id: "teal",
    label: "Teal",
    previewHex: "#14b8a6",
  },
  green: {
    id: "green",
    label: "Green",
    previewHex: "#10b981",
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    previewHex: "#22c55e",
  },
  lime: {
    id: "lime",
    label: "Lime",
    previewHex: "#84cc16",
  },
  yellow: {
    id: "yellow",
    label: "Yellow",
    previewHex: "#eab308",
  },
  amber: {
    id: "amber",
    label: "Amber",
    previewHex: "#f59e0b",
  },
  orange: {
    id: "orange",
    label: "Orange",
    previewHex: "#f97316",
  },
  red: {
    id: "red",
    label: "Red",
    previewHex: "#ef4444",
  },
  rose: {
    id: "rose",
    label: "Rose",
    previewHex: "#f43f5e",
  },
  pink: {
    id: "pink",
    label: "Pink",
    previewHex: "#ec4899",
  },
  fuchsia: {
    id: "fuchsia",
    label: "Fuchsia",
    previewHex: "#d946ef",
  },
  purple: {
    id: "purple",
    label: "Purple",
    previewHex: "#8b5cf6",
  },
  violet: {
    id: "violet",
    label: "Violet",
    previewHex: "#7c3aed",
  },
};

export const THEME_MODES: Record<ThemeMode, ThemeModeMeta> = {
  dark: {
    id: "dark",
    label: "Dark",
    description: "Low-light focus",
  },
  light: {
    id: "light",
    label: "Light",
    description: "Daylight clarity",
  },
};

export function applyTheme(mode: ThemeMode, accent: AccentColor): void {
  const root = document.documentElement;

  const safeMode: ThemeMode = mode === "light" ? "light" : "dark";
  const safeAccent: AccentColor = ACCENT_PRESETS[accent] ? accent : "blue";

  root.setAttribute("data-theme", safeMode);
  root.setAttribute("data-accent", safeAccent);

  if (safeMode === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }

  try {
    localStorage.setItem("sonora_theme_mode", safeMode);
    localStorage.setItem("sonora_accent_color", safeAccent);
  } catch {
    // Ignore storage errors
  }
}
