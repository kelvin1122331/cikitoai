import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Service worker: membuat CikitoAI bisa dipasang sebagai aplikasi (punya ikon
 * dan jendela sendiri) serta menjaga cangkang UI tetap terbuka saat offline.
 * Di mode dev, SW dijalankan sebagai pass-through agar HMR tidak terganggu.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.PROD ? '/sw.js' : '/sw.js?mode=dev')
      .catch(() => {
        /* pemasangan gagal (mis. konteks tidak aman) — aplikasi tetap jalan */
      })
  })
}
