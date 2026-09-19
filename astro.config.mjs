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
    sitemap({
      filter: (page) => !page.endsWith('/quitar-fondo/') && !page.endsWith('/en/remove-background/')
    })
  ],

  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
