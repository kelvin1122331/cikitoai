import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Build khusus bundel tempel (embed): satu berkas IIFE mandiri berisi React,
 * widget, dan CSS-nya (disuntikkan ke Shadow DOM). Hasilnya disimpan di
 * public/embed/ supaya ikut tersaji oleh dev server maupun build produksi.
 *
 *   npm run build:embed   →   public/embed/cikito-widget.js
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'public/embed',
    emptyOutDir: true,
    target: 'es2020',
    cssTarget: 'chrome100',
    cssCodeSplit: false,
    lib: {
      entry: 'src/embed/index.tsx',
      name: 'CikitoAI',
      formats: ['iife'],
      fileName: () => 'cikito-widget.js',
    },
    rollupOptions: {
      output: { extend: true, inlineDynamicImports: true },
    },
  },
})
