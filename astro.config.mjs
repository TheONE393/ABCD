// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Set your final production domain here or pass via PUBLIC_SITE_URL env var
  site: process.env.PUBLIC_SITE_URL || 'https://microbial-biology-lab.pages.dev',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
