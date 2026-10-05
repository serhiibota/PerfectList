import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';

const iconSet = (suffix = ''): ManifestOptions['icons'] => [
  { src: `pwa-192x192${suffix}.png`, sizes: '192x192', type: 'image/png' },
  { src: `pwa-512x512${suffix}.png`, sizes: '512x512', type: 'image/png' },
  { src: `pwa-maskable-512x512${suffix}.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

const manifest: Partial<ManifestOptions> = {
  id: '/',
  name: 'MinimalList — список покупок',
  short_name: 'MinimalList',
  description: 'Минималистичный мульти-магазинный список покупок с подсчётом бюджета.',
  lang: 'ru',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#f7f6f3',
  theme_color: '#f7f6f3',
  icons: iconSet(),
};

/** Emits manifest-light.webmanifest: the same app with the light («Лён») icon set. */
const lightManifest = (): Plugin => ({
  name: 'minimallist:light-manifest',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'manifest-light.webmanifest',
      source: JSON.stringify({ ...manifest, icons: iconSet('-light') }),
    });
  },
});

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    lightManifest(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeManifestIcons: false,
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
