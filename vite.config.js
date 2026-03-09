import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Smart Picking System',
        short_name: 'Picking',
        theme_color: '#8b5cf6', // สีม่วงหลัก
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3045/3045670.png', // ไอคอนชั่วคราว
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})