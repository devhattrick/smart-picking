import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBase = env.VITE_BASE_PATH || (mode === 'production' ? '/smart-picking/' : '/')
  const withLeadingSlash = rawBase.startsWith('/') ? rawBase : `/${rawBase}`
  const base = withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`

  return {
    base,
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
          start_url: base,
          scope: base,
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
  }
})
