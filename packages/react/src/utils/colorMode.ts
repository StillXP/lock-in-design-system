export type ColorModePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ds-color-mode';

/**
 * Apply a color mode. 'system' removes the override so the
 * prefers-color-scheme media query in tokens.css takes over.
 */
export function setColorMode(mode: ColorModePreference, root: HTMLElement = document.documentElement): void {
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* storage unavailable (private mode) — mode still applies for this page */
  }
}

/** Read the saved preference (defaults to 'system'). */
export function getColorMode(): ColorModePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    /* ignore */
  }
  return 'system';
}

/** Resolve what is actually showing right now. */
export function getResolvedColorMode(root: HTMLElement = document.documentElement): 'light' | 'dark' {
  const attr = root.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
