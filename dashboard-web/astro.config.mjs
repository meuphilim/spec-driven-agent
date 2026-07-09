import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'http://127.0.0.1:3333',
  vite: {
    plugins: [tailwindcss()],
  },
});
