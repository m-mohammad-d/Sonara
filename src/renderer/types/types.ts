export type ShortcutCategory = 'playback' | 'navigation' | 'queue' | 'general';
export type ShortcutScope = 'app' | 'global';

export interface ShortcutBinding {
  id: string;
  category: ShortcutCategory;
  label: string;
  description: string;
  defaultKeys: string | null;
  keys: string | null;
  scope: ShortcutScope;
  enabled: boolean;
  allowInInput?: boolean;
  isDestructive?: boolean;
}

export interface UserShortcutConfig {
  keys: string | null;
  enabled?: boolean;
}

export type UserShortcutOverrides = Record<string, UserShortcutConfig | string | null>;
