import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const STORAGE_KEY = 'theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const THEME_CHANGE_EVENT = 'pixel-crunch:theme-change';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const value = localStorage.getItem(STORAGE_KEY);
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }

  return 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }

  return theme;
}

function applyThemeClass(theme: Theme): ResolvedTheme {
  const nextResolvedTheme = resolveTheme(theme);

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', nextResolvedTheme === 'dark');
  }

  return nextResolvedTheme;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const initialTheme = getStoredTheme();
    setThemeState(initialTheme);
    setResolvedTheme(applyThemeClass(initialTheme));

    const mediaQuery = window.matchMedia(MEDIA_QUERY);

    const onSystemThemeChange = () => {
      const currentTheme = getStoredTheme();
      if (currentTheme !== 'system') {
        return;
      }

      setResolvedTheme(applyThemeClass('system'));
    };

    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      setThemeState(nextTheme);
      setResolvedTheme(applyThemeClass(nextTheme));
    };

    mediaQuery.addEventListener('change', onSystemThemeChange);
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', onSystemThemeChange);
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    };
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setResolvedTheme(applyThemeClass(nextTheme));
    window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: nextTheme }));
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
