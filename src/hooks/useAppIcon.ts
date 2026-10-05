import { useCallback, useState } from 'react';

export type AppIcon = 'dark' | 'light';

const STORAGE_KEY = 'minimallist:icon';

const FILES: Record<AppIcon, { favicon: string; appleTouch: string; manifest: string }> = {
  dark: { favicon: '/favicon.svg', appleTouch: '/apple-touch-icon.png', manifest: '/manifest.webmanifest' },
  light: {
    favicon: '/favicon-light.svg',
    appleTouch: '/apple-touch-icon-light.png',
    manifest: '/manifest-light.webmanifest',
  },
};

export const readAppIcon = (): AppIcon => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const setLink = (rel: string, href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) link.href = href;
};

/**
 * Points the favicon, the iOS home-screen icon and the web manifest at the chosen icon.
 * Browsers read these when the app is added to the home screen, so a change applies
 * to the next installation.
 */
export const applyAppIcon = (icon: AppIcon) => {
  const files = FILES[icon];
  setLink('icon', files.favicon);
  setLink('apple-touch-icon', files.appleTouch);
  setLink('manifest', files.manifest);
};

export function useAppIcon() {
  const [icon, setIconState] = useState<AppIcon>(readAppIcon);

  const setIcon = useCallback((next: AppIcon) => {
    setIconState(next);
    applyAppIcon(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { icon, setIcon };
}
