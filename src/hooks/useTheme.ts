import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'minimallist:theme';

const readMode = (): ThemeMode => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* ignore */
  }
  return 'system';
};

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readMode);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((m) => m.setAttribute('content', dark ? '#111113' : '#f7f6f3'));
    };
    apply();
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [mode]);

  return { mode, setMode };
}
