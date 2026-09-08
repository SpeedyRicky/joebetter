import { ThemeMode } from '../types';

const THEME_STORAGE_KEY = 'gemini_assistant_theme';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

export function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  const root = document.documentElement;
  const resolved = mode === 'system' ? getSystemTheme() : mode;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  return resolved;
}

export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyTheme(mode);
}
