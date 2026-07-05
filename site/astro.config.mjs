import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Auto-detect the deploy target so the same codebase works on GitHub Pages
// (subpath, fixed domain) and Vercel (root path, dynamic domain) without
// requiring manual env var setup on either platform.
const isVercel = Boolean(process.env.VERCEL);

const base = process.env.BASE_PATH ?? (isVercel ? '/' : '/spec-driven-agent/');

const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://meuphilim.github.io');

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
