import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'https://teamtrack-backend-wwo6.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
