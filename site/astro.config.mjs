import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// On Vercel: BASE_PATH is not set → serve from root '/'
// On GitHub Pages: BASE_PATH='/spec-driven-agent/' is set via workflow env
const isVercel = process.env.VERCEL === '1';
const base = isVercel ? '/' : (process.env.BASE_PATH || '/spec-driven-agent/');
const siteUrl = isVercel
  ? (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://spec-driven-agent.vercel.app')
  : 'https://meuphilim.github.io';

export default defineConfig({
  site: siteUrl,
  base,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
