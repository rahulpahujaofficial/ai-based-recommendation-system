import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: {
      // Forward all /api/* and /widget/* requests to the Flask backend.
      // This runs server-side (no browser CORS) and works both in local dev
      // and inside GitHub Codespaces where the browser cannot reach localhost:5000 directly.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/widget': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'charts': ['recharts'],
          'motion': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
