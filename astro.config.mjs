// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pixel-crunch.josuem01.dev',
  integrations: [
    react(),
    sitemap()
  ],

  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Worker imports escape the initial crawl. Prepare them on the dev server
      // so first use does not invalidate active pages; browser loading stays lazy.
      include: [
        'browser-image-compression',
        '@imgly/background-removal',
        'jszip',
        'react-dropzone',
        'lucide-react',
        'sonner',
        'gifenc/dist/gifenc.esm.js',
        'gifuct-js',
        'file-saver',
      ]
    }
  }
});
