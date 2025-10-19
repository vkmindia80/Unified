import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'globalThis',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
    hmr: {
      clientPort: 3000,
    },
    allowedHosts: [
      'unitalk-game.preview.emergentagent.com',
      '.preview.emergentagent.com',
      'localhost',
      '.localhost'
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})