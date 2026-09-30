/**
 * Server produksi CikitoAI (tanpa dependensi):
 *  - menyajikan hasil build statis dari /dist
 *  - menjalankan API proxy yang sama seperti saat dev (/api/*)
 *
 * Jalankan:  npm run build && npm start
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { apiMiddleware } from './api.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''))

  // Directory → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }
  // SPA fallback
  if (!fs.existsSync(filePath)) filePath = path.join(ROOT, 'index.html')

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('Build belum ada. Jalankan: npm run build')
  }

  const ext = path.extname(filePath).toLowerCase()
  const immutable = filePath.includes(`${path.sep}assets${path.sep}`)
  const isSW = path.basename(filePath) === 'sw.js'
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    // Service worker harus selalu diperiksa ulang supaya pembaruan cepat masuk.
    ...(isSW ? { 'Service-Worker-Allowed': '/' } : {}),
  })
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  apiMiddleware(req, res, () => serveStatic(req, res)).catch((err) => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ error: String(err?.message || err) }))
    } else if (!res.writableEnded) {
      res.end()
    }
  })
})

server.headersTimeout = 0
server.requestTimeout = 0
server.listen(PORT, HOST, () => {
  console.log(`\n  ⚡ CikitoAI siap di http://${HOST}:${PORT}\n`)
})
