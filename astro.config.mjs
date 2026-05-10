// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import vitePwa from '@vite-pwa/astro';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pixel-crunch.josuem01.dev',
  integrations: [
    react(),
    vitePwa({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'favicon.png',
        'Logo.svg',
        'Logo.png'
      ],
      manifest: {
        name: 'Pixel Crunch',
        short_name: 'Pixel Crunch',
        description: 'Compresion y conversion de imagenes en tu navegador, gratis y privado.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#272822',
        theme_color: '#272822',
        icons: [
          {
            src: '/Logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/Logo.png',
            sizes: '160x133',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon.png',
            sizes: '139x99',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: [],
        navigateFallback: null,
        runtimeCaching: []
      }
    }),
    sitemap()
  ],

  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()]
  }
});