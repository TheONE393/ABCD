// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Set your final production domain here or pass via PUBLIC_SITE_URL env var
  site: process.env.PUBLIC_SITE_URL || 'https://TheONE393.github.io',
  base: process.env.PUBLIC_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/ABCD' : '/'),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          '**/.cache/**',
          '**/node_modules/**',
          '**/.git/**',
          '**/public/**',
        ],
      },
    },
  },
});
