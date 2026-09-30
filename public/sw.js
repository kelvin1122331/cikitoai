/**
 * Service worker CikitoAI.
 *
 * Tugasnya dua:
 *  1. Membuat aplikasi bisa dipasang (installable) sebagai aplikasi desktop/ponsel.
 *  2. Menyimpan cangkang aplikasi agar tetap terbuka walau jaringan mati
 *     (jawaban AI tetap butuh internet — hanya tampilannya yang di-cache).
 *
 * Saat dev (`/sw.js?mode=dev`) semua permintaan dibiarkan lewat apa adanya
 * supaya HMR Vite tidak terganggu; handler fetch tetap ada karena Chrome
 * mensyaratkannya untuk tombol "Pasang aplikasi".
 */
const VERSION = 'cikito-v1'
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png']
const DEV = new URL(self.location.href).searchParams.get('mode') === 'dev'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  if (DEV) return
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .catch(() => {}),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  if (DEV) return

  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // panggilan ke penyedia AI: jangan disentuh
  if (url.pathname.startsWith('/api/')) return // jawaban AI tidak pernah di-cache

  // Navigasi halaman: utamakan jaringan, pakai cache hanya bila offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          const cache = await caches.open(VERSION)
          cache.put('/', fresh.clone()).catch(() => {})
          return fresh
        } catch {
          return (await caches.match('/')) ?? new Response('Offline', { status: 503 })
        }
      })(),
    )
    return
  }

  // Aset statis (hash pada nama berkas): cache dulu, perbarui di latar.
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION)
      const hit = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone()).catch(() => {})
          return res
        })
        .catch(() => hit)
      return hit ?? network
    })(),
  )
})
