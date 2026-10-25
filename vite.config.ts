/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  // `npm run build:standalone` genera un único HTML que se abre con doble clic (file://),
  // sin servidor. En ese modo no hay service worker (los navegadores no lo permiten en file://).
  const standalone = mode === 'standalone';

  const plugins: PluginOption[] = [react()];
  if (standalone) {
    plugins.push(viteSingleFile());
  } else {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Palabra · Inglés en 31 días',
          short_name: 'Palabra',
          description: 'Aprende inglés con práctica diaria, repaso espaciado y pronunciación.',
          lang: 'es',
          theme_color: '#153641',
          background_color: '#f5f2e9',
          display: 'standalone',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    );
  }

  return {
    // En GitHub Pages la app vive en /<nombre-del-repo>/. El workflow define BASE_PATH.
    base: standalone ? './' : (process.env.BASE_PATH ?? '/'),
    plugins,
    build: standalone ? { outDir: 'dist-standalone', copyPublicDir: false } : undefined,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        include: ['src/domain/**', 'src/store/**', 'src/lib/**'],
        reporter: ['text', 'html'],
      },
    },
  };
});
