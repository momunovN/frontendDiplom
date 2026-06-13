import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Proxy нужен только для локальной разработки
    proxy: {
      '/api': {
        target: 'http://localhost:5000',   // ← для локалки
        changeOrigin: true,
      }
    }
  },
  // build: {
  //   outDir: 'dist'
  // }
})