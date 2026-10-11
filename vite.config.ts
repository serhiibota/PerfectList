import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';

const icons: ManifestOptions['icons'] = [
  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
  { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
  icons,
};

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
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
