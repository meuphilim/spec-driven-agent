import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.BASE_PATH || '/spec-driven-agent/';

export default defineConfig({
  site: 'https://meuphilim.github.io',
  base,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
