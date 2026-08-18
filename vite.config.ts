import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base: đặt theo tên repo cho GitHub Pages (https://<user>.github.io/quizzi/)
export default defineConfig({
  base: '/quizzi/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Quizzi',
        short_name: 'Quizzi',
        description: 'Bé học bài qua quiz vui',
        theme_color: '#ffd23f',
        background_color: '#fff8e7',
        display: 'standalone',
        icons: [
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
