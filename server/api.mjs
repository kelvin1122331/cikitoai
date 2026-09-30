/**
 * CikitoAI — Backend proxy ringan (tanpa dependensi).
 *
 * Kenapa perlu proxy?
 *  - Menghindari masalah CORS: sebagian penyedia AI menolak panggilan langsung
 *    dari browser (widget bisa juga berjalan dalam mode langsung, lihat
 *    src/lib/direct.ts, tetapi proxy adalah jalur paling kompatibel).
 *  - Logika penerjemahan penyedia dibagi dengan browser & ekstensi lewat
 *    shared/ai-core.mjs.
 *
 * Catatan privasi: API key hanya diteruskan (relay) untuk permintaan yang
 * sedang berjalan. Tidak pernah ditulis ke disk, tidak pernah di-log.
 *
 * Endpoint:
 *   GET  /api/health
 *   POST /api/models   → { kind, baseUrl, apiKey } → { models: [...] }
 *   POST /api/chat     → { kind, baseUrl, apiKey, model, messages, ... } → SSE
 */
import {
  buildModelsRequest,
  buildUpstreamRequest,
  demoReply,
  humanizeUpstreamError,
  isLocalUrl,
  parseModelsResponse,
  pumpProviderStream,
  tokenizeForDemo,
} from '../shared/ai-core.mjs'

const MAX_BODY_BYTES = 4 * 1024 * 1024 // 4 MB
const REQUEST_TIMEOUT_MS = 180_000

/* ------------------------------------------------------------------ utils */

function json(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Ukuran permintaan terlalu besar (maks 4 MB).'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Body JSON tidak valid.'))
      }
    })
    req.on('error', reject)
  })
}

/* ------------------------------------------------------------------- SSE */

function sseInit(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write(': ok\n\n')
  if (typeof res.flushHeaders === 'function') res.flushHeaders()
}

function sseSend(res, obj) {
  if (res.writableEnded) return
  res.write(`data: ${JSON.stringify(obj)}\n\n`)
}

/* --------------------------------------------------------------- handlers */

async function handleDemoStream(res, body) {
  sseInit(res)
  const tokens = tokenizeForDemo(demoReply(body.messages || []))
  for (const tok of tokens) {
    if (res.writableEnded) return
    sseSend(res, { type: 'delta', text: tok })
    await new Promise((r) => setTimeout(r, 12))
  }
  sseSend(res, { type: 'usage', usage: { in: 0, out: tokens.length } })
  sseSend(res, { type: 'done' })
  res.end()
}

async function handleChat(req, res, body) {
  const kind = body.kind || 'openai'

  if (kind === 'demo') return handleDemoStream(res, body)

  if (!body.model) return json(res, 400, { error: 'Nama model belum diisi.' })
  if (!body.apiKey && !isLocalUrl(body.baseUrl || '')) {
    return json(res, 400, { error: 'API key belum diisi.' })
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(res, 400, { error: 'Tidak ada pesan untuk dikirim.' })
  }

  const { url, init } = buildUpstreamRequest(body, { stream: true })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onClose = () => controller.abort()
  req.on('close', onClose)

  let upstream
  try {
    upstream = await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    clearTimeout(timeout)
    req.off('close', onClose)
    const msg =
      err?.name === 'AbortError'
        ? 'Permintaan dibatalkan atau melewati batas waktu.'
        : `Tidak bisa menghubungi penyedia di ${url}. ${err?.message || ''}`.trim()
    return json(res, 502, { error: msg })
  }

  if (!upstream.ok) {
    clearTimeout(timeout)
    req.off('close', onClose)
    const text = await upstream.text().catch(() => '')
    return json(res, upstream.status === 401 ? 401 : 502, {
      error: humanizeUpstreamError(upstream.status, text),
    })
  }

  sseInit(res)

  try {
    if (!upstream.body) throw new Error('Penyedia tidak mengirim body.')
    const sawText = await pumpProviderStream(kind, upstream.body, (ev) => sseSend(res, ev))
    if (!sawText) {
      sseSend(res, {
        type: 'notice',
        message: 'Model tidak mengirim teks apa pun (kemungkinan tersaring oleh filter keamanan).',
      })
    }
    sseSend(res, { type: 'done' })
  } catch (err) {
    if (err?.name !== 'AbortError') {
      sseSend(res, { type: 'error', message: `Aliran data terputus: ${err?.message || err}` })
    }
  } finally {
    clearTimeout(timeout)
    req.off('close', onClose)
    if (!res.writableEnded) res.end()
  }
}

async function handleModels(res, body) {
  const kind = body.kind || 'openai'
  if (kind === 'demo') {
    return json(res, 200, { models: [{ id: 'cikito-demo', label: 'CikitoAI Demo (lokal)' }] })
  }

  const { url, headers } = buildModelsRequest(body)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const r = await fetch(url, { headers, signal: controller.signal })
    const text = await r.text()
    if (!r.ok) return json(res, 502, { error: humanizeUpstreamError(r.status, text) })
    return json(res, 200, { models: parseModelsResponse(kind, JSON.parse(text)) })
  } catch (err) {
    return json(res, 502, {
      error:
        err?.name === 'AbortError'
          ? 'Waktu habis saat mengambil daftar model.'
          : `Gagal mengambil daftar model: ${err?.message || err}`,
    })
  } finally {
    clearTimeout(timeout)
  }
}

/* ---------------------------------------------------------- middleware */

/**
 * Middleware gaya connect: (req, res, next).
 * Menangani semua rute di bawah /api/ dan meneruskan sisanya ke `next()`.
 */
export async function apiMiddleware(req, res, next) {
  const pathname = (req.url || '').split('?')[0]
  if (!pathname.startsWith('/api/')) return next ? next() : json(res, 404, { error: 'Not found' })

  // CORS: widget bisa ditempel di halaman/origin mana pun.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Max-Age', '86400')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  try {
    if (pathname === '/api/health') {
      return json(res, 200, { ok: true, service: 'cikitoai', time: new Date().toISOString() })
    }

    if (pathname === '/api/chat' || pathname === '/api/models') {
      if (req.method !== 'POST') return json(res, 405, { error: 'Gunakan metode POST.' })
      const body = await readBody(req)
      return pathname === '/api/chat' ? handleChat(req, res, body) : handleModels(res, body)
    }

    return json(res, 404, { error: `Rute API tidak dikenal: ${pathname}` })
  } catch (err) {
    if (!res.headersSent) return json(res, 400, { error: err?.message || 'Permintaan tidak valid.' })
    if (!res.writableEnded) res.end()
  }
}

export default apiMiddleware
