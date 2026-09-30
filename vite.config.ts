import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiMiddleware } from './server/api.mjs'

/**
 * Saat berjalan di dalam sandbox/preview (di balik reverse proxy HTTPS),
 * klien HMR harus terhubung ke port 443 lewat WSS, bukan ke port dev lokal.
 */
const inSandbox = process.env.E2B_SANDBOX === 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Backend ringan untuk mem-proxy permintaan ke penyedia AI.
      // Dipakai di dev (lewat middleware Vite) dan di produksi (server/index.mjs).
      name: 'cikito-api-middleware',
      configureServer(server) {
        server.middlewares.use(apiMiddleware)
      },
      configurePreviewServer(server) {
        server.middlewares.use(apiMiddleware)
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    hmr: inSandbox ? { clientPort: 443, protocol: 'wss' } : true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    cssTarget: 'chrome100',
    chunkSizeWarningLimit: 900,
  },
})
