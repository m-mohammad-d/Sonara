const MODIFIER_ORDER: Record<string, number> = {
  Ctrl: 1,
  Alt: 2,
  Shift: 3,
  Meta: 4,
};

const RESERVED_COMBOS: Record<string, string> = {
  'Alt+F4': 'System close window',
  'Ctrl+C': 'Clipboard copy',
  'Ctrl+V': 'Clipboard paste',
  'Ctrl+X': 'Clipboard cut',
  'Ctrl+A': 'Select all text',
  'Ctrl+Z': 'Undo action',
  'Ctrl+Y': 'Redo action',
  'Ctrl+R': 'Application reload',
  'F5': 'Application refresh',
  'Ctrl+Shift+I': 'Developer tools',
  'F12': 'Developer tools',
};

export function eventToKeyCombo(e: KeyboardEvent): { combo: string; isModifierOnly: boolean } {
  const isCtrl = e.ctrlKey;
  const isAlt = e.altKey;
  const isShift = e.shiftKey;
  const isMeta = e.metaKey;

  const modifierKeys = new Set([
    'Control',
    'Alt',
    'Shift',
    'Meta',
    'ControlLeft',
    'ControlRight',
    'AltLeft',
    'AltRight',
    'ShiftLeft',
    'ShiftRight',
    'MetaLeft',
    'MetaRight',
  ]);

  if (modifierKeys.has(e.code) || modifierKeys.has(e.key)) {
    const parts: string[] = [];
    if (isCtrl) parts.push('Ctrl');
    if (isAlt) parts.push('Alt');
    if (isShift) parts.push('Shift');
    if (isMeta) parts.push('Meta');
    return { combo: parts.join('+'), isModifierOnly: true };
  }

  let primaryKey = '';

  if (e.code.startsWith('Key')) {
    primaryKey = e.code.slice(3).toUpperCase();
  } else if (e.code.startsWith('Digit')) {
    primaryKey = e.code.slice(5);
  } else if (e.code.startsWith('Numpad')) {
    primaryKey = e.code.replace('Numpad', 'Num');
  } else if (e.code === 'Space') {
    primaryKey = 'Space';
  } else if (e.code === 'Enter') {
    primaryKey = 'Enter';
  } else if (e.code === 'Escape') {
    primaryKey = 'Escape';
  } else if (e.code === 'Tab') {
    primaryKey = 'Tab';
  } else if (e.code === 'Backspace') {
    primaryKey = 'Backspace';
  } else if (e.code === 'Delete') {
    primaryKey = 'Delete';
  } else if (e.code === 'ArrowUp') {
    primaryKey = 'ArrowUp';
  } else if (e.code === 'ArrowDown') {
    primaryKey = 'ArrowDown';
  } else if (e.code === 'ArrowLeft') {
    primaryKey = 'ArrowLeft';
  } else if (e.code === 'ArrowRight') {
    primaryKey = 'ArrowRight';
  } else if (/^F\d{1,2}$/.test(e.code)) {
    primaryKey = e.code;
  } else if (e.code === 'Comma') {
    primaryKey = ',';
  } else if (e.code === 'Period') {
    primaryKey = '.';
  } else if (e.code === 'Slash') {
    primaryKey = '/';
  } else if (e.code === 'Backslash') {
    primaryKey = '\\';
  } else if (e.code === 'BracketLeft') {
    primaryKey = '[';
  } else if (e.code === 'BracketRight') {
    primaryKey = ']';
  } else if (e.code === 'Minus') {
    primaryKey = '-';
  } else if (e.code === 'Equal') {
    primaryKey = '=';
  } else if (e.code === 'Semicolon') {
    primaryKey = ';';
  } else if (e.code === 'Quote') {
    primaryKey = "'";
  } else {
    if (e.key && e.key.length === 1) {
      primaryKey = e.key.toUpperCase();
    } else {
      primaryKey = e.key || e.code;
    }
  }

  const parts: string[] = [];
  if (isCtrl) parts.push('Ctrl');
  if (isAlt) parts.push('Alt');
  if (isShift) parts.push('Shift');
  if (isMeta) parts.push('Meta');
  parts.push(primaryKey);

  return { combo: parts.join('+'), isModifierOnly: false };
}

export function normalizeKeyCombo(combo: string | null): string | null {
  if (!combo) return null;
  const rawParts = combo.split('+').map((p) => p.trim()).filter(Boolean);
  if (rawParts.length === 0) return null;

  const modifiers: string[] = [];
  let primary = '';

  for (const part of rawParts) {
    const lower = part.toLowerCase();
    if (lower === 'ctrl' || lower === 'control') {
      modifiers.push('Ctrl');
    } else if (lower === 'alt') {
      modifiers.push('Alt');
    } else if (lower === 'shift') {
      modifiers.push('Shift');
    } else if (lower === 'meta' || lower === 'cmd' || lower === 'command') {
      modifiers.push('Meta');
    } else if (lower === 'space') {
      primary = 'Space';
    } else if (lower === 'enter') {
      primary = 'Enter';
    } else if (lower === 'escape' || lower === 'esc') {
      primary = 'Escape';
    } else if (lower === 'arrowup' || lower === 'up') {
      primary = 'ArrowUp';
    } else if (lower === 'arrowdown' || lower === 'down') {
      primary = 'ArrowDown';
    } else if (lower === 'arrowleft' || lower === 'left') {
      primary = 'ArrowLeft';
    } else if (lower === 'arrowright' || lower === 'right') {
      primary = 'ArrowRight';
    } else if (lower === 'backspace') {
      primary = 'Backspace';
    } else if (lower === 'delete' || lower === 'del') {
      primary = 'Delete';
    } else if (lower === 'tab') {
      primary = 'Tab';
    } else {
      primary = part.length === 1 ? part.toUpperCase() : part;
    }
  }

  modifiers.sort((a, b) => (MODIFIER_ORDER[a] || 99) - (MODIFIER_ORDER[b] || 99));

  if (!primary) {
    return modifiers.join('+');
  }

  return [...modifiers, primary].join('+');
}

export function splitKeyCombo(combo: string | null): string[] {
  if (!combo) return [];
  return combo.split('+').map((s) => s.trim()).filter(Boolean);
}

export function formatKeyForDisplay(key: string): { label: string; isSymbol?: boolean } {
  switch (key) {
    case 'ArrowUp':
      return { label: '↑', isSymbol: true };
    case 'ArrowDown':
      return { label: '↓', isSymbol: true };
    case 'ArrowLeft':
      return { label: '←', isSymbol: true };
    case 'ArrowRight':
      return { label: '→', isSymbol: true };
    case 'Space':
      return { label: 'Space' };
    case 'Escape':
      return { label: 'Esc' };
    case 'Backspace':
      return { label: '⌫', isSymbol: true };
    case 'Delete':
      return { label: 'Del' };
    case 'Enter':
      return { label: '↵', isSymbol: true };
    default:
      return { label: key };
  }
}

export function isReservedCombo(combo: string | null): { reserved: boolean; reason?: string } {
  if (!combo) return { reserved: false };
  const normalized = normalizeKeyCombo(combo);
  if (!normalized) return { reserved: false };

  if (RESERVED_COMBOS[normalized]) {
    return { reserved: true, reason: RESERVED_COMBOS[normalized] };
  }
  return { reserved: false };
}

export function combosMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return normalizeKeyCombo(a) === normalizeKeyCombo(b);
}
