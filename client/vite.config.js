import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Tabler ikonkalari minglab kichik modul qo'shgani uchun Rollup'ning
        // avtomatik chunking evristikasi buzilib, motion/react asosiy bundle'ga
        // qo'shilib ketardi — shu yerda aniq ajratib qo'yamiz.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@tabler/icons-react')) return 'icons'
          if (id.includes('motion') || id.includes('framer-motion')) return 'motion'
          if (id.includes('socket.io-client')) return 'socket'
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Kelajakdagi real-time server uchun (server/ papkasi)
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
