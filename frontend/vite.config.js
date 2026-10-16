import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2019'
  },
  esbuild: {
    target: 'es2019'
  },
  server: {
    port: 5183,
    proxy: {
      // All /api/* requests forwarded to backend — eliminates CORS in dev
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
