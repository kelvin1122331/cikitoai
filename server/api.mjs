/**
 * CikitoAI — Backend proxy ringan (tanpa dependensi).
 *
 * Kenapa perlu proxy?
 *  - Menghindari masalah CORS: sebagian besar penyedia AI tidak mengizinkan
 *    panggilan langsung dari browser.
 *  - Menyatukan 3 "bentuk" API paling umum menjadi satu aliran (stream) seragam:
 *      • openai     → semua endpoint OpenAI-compatible (OpenAI, Groq, OpenRouter,
 *                     DeepSeek, Mistral, Together, xAI, Ollama, LM Studio, kustom…)
 *      • anthropic  → Claude Messages API
 *      • gemini     → Google Generative Language API
 *      • demo       → jawaban simulasi lokal (tanpa API key) untuk mencoba UI
 *
 * Catatan privasi: API key hanya diteruskan (relay) untuk permintaan yang
 * sedang berjalan. Tidak pernah ditulis ke disk, tidak pernah di-log.
 *
 * Endpoint:
 *   GET  /api/health
 *   POST /api/models   → { kind, baseUrl, apiKey } → { models: [...] }
 *   POST /api/chat     → { kind, baseUrl, apiKey, model, messages, ... } → SSE
 */

const MAX_BODY_BYTES = 4 * 1024 * 1024 // 4 MB
const REQUEST_TIMEOUT_MS = 180_000
const ANTHROPIC_VERSION = '2023-06-01'

/* ------------------------------------------------------------------ utils */

function stripSlash(url = '') {
  return String(url).trim().replace(/\/+$/, '')
}

/** Gabungkan base URL + path tanpa menduplikasi segmen (mis. /v1/v1). */
function joinUrl(base, path) {
  const b = stripSlash(base)
  const p = String(path).replace(/^\/+/, '')
  const segs = p.split('/')
  // Hilangkan awalan path yang sudah ada di akhir base.
  let start = 0
  for (let take = segs.length; take > 0; take--) {
    const prefix = '/' + segs.slice(0, take).join('/')
    if (b.toLowerCase().endsWith(prefix.toLowerCase())) {
      start = take
      break
    }
  }
  const rest = segs.slice(start).join('/')
  return rest ? `${b}/${rest}` : b
}

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

/** Ambil pesan error yang enak dibaca dari respons penyedia. */
function humanizeUpstreamError(status, text) {
  let detail = (text || '').slice(0, 1200)
  try {
    const parsed = JSON.parse(text)
    detail =
      parsed?.error?.message ??
      parsed?.error?.msg ??
      parsed?.message ??
      (Array.isArray(parsed?.error) ? parsed.error[0]?.message : null) ??
      parsed?.error?.type ??
      detail
    if (typeof detail !== 'string') detail = JSON.stringify(detail).slice(0, 1200)
  } catch {
    /* biarkan teks mentah */
  }

  const hints = {
    401: 'API key ditolak (401). Pastikan key benar, aktif, dan cocok dengan penyedia yang dipilih.',
    403: 'Akses ditolak (403). Key mungkin tidak punya izin untuk model ini, atau diblokir di wilayah Anda.',
    404: 'Endpoint atau model tidak ditemukan (404). Cek kembali Base URL dan nama model.',
    413: 'Permintaan terlalu besar (413). Coba kurangi panjang percakapan.',
    422: 'Parameter tidak valid (422). Cek nama model atau parameter lain.',
    429: 'Kena limit (429). Terlalu banyak permintaan atau kuota habis — tunggu sebentar lalu coba lagi.',
    500: 'Server penyedia sedang bermasalah (500). Coba lagi beberapa saat lagi.',
    502: 'Gateway penyedia bermasalah (502). Coba lagi.',
    503: 'Layanan penyedia sedang tidak tersedia (503). Coba lagi nanti.',
  }
  const hint = hints[status] || `Penyedia membalas dengan status ${status}.`
  return detail ? `${hint}\n\n${detail}` : hint
}

/* ------------------------------------------------- pembangun permintaan AI */

function buildUpstreamRequest(cfg, { stream }) {
  const {
    kind = 'openai',
    baseUrl,
    apiKey = '',
    model,
    messages = [],
    system = '',
    temperature = 0.7,
    maxTokens = 2048,
    topP,
    extraHeaders = {},
  } = cfg

  const clean = messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim() !== '')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

  if (kind === 'anthropic') {
    return {
      url: joinUrl(baseUrl || 'https://api.anthropic.com', '/v1/messages'),
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          ...extraHeaders,
        },
        body: JSON.stringify({
          model,
          max_tokens: Math.max(1, Math.min(Number(maxTokens) || 2048, 64000)),
          temperature: Number(temperature),
          ...(topP != null ? { top_p: Number(topP) } : {}),
          ...(system ? { system } : {}),
          messages: clean,
          stream,
        }),
      },
    }
  }

  if (kind === 'gemini') {
    const base = baseUrl || 'https://generativelanguage.googleapis.com'
    const method = stream ? 'streamGenerateContent' : 'generateContent'
    const url =
      joinUrl(base, `/v1beta/models/${encodeURIComponent(model)}:${method}`) +
      (stream ? '?alt=sse' : '')
    return {
      url,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
          ...extraHeaders,
        },
        body: JSON.stringify({
          contents: clean.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          generationConfig: {
            temperature: Number(temperature),
            maxOutputTokens: Math.max(1, Math.min(Number(maxTokens) || 2048, 65536)),
            ...(topP != null ? { topP: Number(topP) } : {}),
          },
        }),
      },
    }
  }

  // Default: OpenAI-compatible
  return {
    url: joinUrl(baseUrl || 'https://api.openai.com/v1', '/chat/completions'),
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages: system ? [{ role: 'system', content: system }, ...clean] : clean,
        temperature: Number(temperature),
        max_tokens: Math.max(1, Math.min(Number(maxTokens) || 2048, 32768)),
        ...(topP != null ? { top_p: Number(topP) } : {}),
        stream,
        ...(stream ? { stream_options: { include_usage: true } } : {}),
      }),
    },
  }
}

/* ------------------------------------------------------- pengurai stream */

/** Ubah ReadableStream byte → iterator baris. */
async function* iterateLines(stream) {
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true })
    let idx
    while ((idx = buffer.indexOf('\n')) !== -1) {
      yield buffer.slice(0, idx).replace(/\r$/, '')
      buffer = buffer.slice(idx + 1)
    }
  }
  buffer += decoder.decode()
  if (buffer) yield buffer
}

/**
 * Terjemahkan potongan JSON dari penyedia → daftar event ternormalisasi.
 * Event: { type: 'delta'|'reasoning'|'usage', ... }
 */
function normalizeChunk(kind, payload) {
  const out = []
  if (!payload || typeof payload !== 'object') return out

  if (kind === 'anthropic') {
    const t = payload.type
    if (t === 'content_block_delta') {
      const d = payload.delta || {}
      if (typeof d.text === 'string' && d.text) out.push({ type: 'delta', text: d.text })
      if (typeof d.thinking === 'string' && d.thinking)
        out.push({ type: 'reasoning', text: d.thinking })
    } else if (t === 'message_delta' && payload.usage) {
      out.push({
        type: 'usage',
        usage: {
          in: payload.usage.input_tokens ?? null,
          out: payload.usage.output_tokens ?? null,
        },
      })
    } else if (t === 'error') {
      out.push({ type: 'error', message: payload.error?.message || 'Terjadi kesalahan pada penyedia.' })
    }
    return out
  }

  if (kind === 'gemini') {
    const cand = payload.candidates?.[0]
    const parts = cand?.content?.parts || []
    for (const p of parts) {
      if (typeof p.text === 'string' && p.text) {
        out.push({ type: p.thought ? 'reasoning' : 'delta', text: p.text })
      }
    }
    if (payload.usageMetadata) {
      out.push({
        type: 'usage',
        usage: {
          in: payload.usageMetadata.promptTokenCount ?? null,
          out: payload.usageMetadata.candidatesTokenCount ?? null,
        },
      })
    }
    if (cand?.finishReason && cand.finishReason !== 'STOP') {
      out.push({ type: 'notice', message: `Model berhenti dengan alasan: ${cand.finishReason}` })
    }
    return out
  }

  // OpenAI-compatible
  const choice = payload.choices?.[0]
  const delta = choice?.delta || choice?.message || {}
  if (typeof delta.content === 'string' && delta.content)
    out.push({ type: 'delta', text: delta.content })
  else if (Array.isArray(delta.content)) {
    for (const part of delta.content)
      if (typeof part?.text === 'string' && part.text) out.push({ type: 'delta', text: part.text })
  }
  if (typeof delta.reasoning_content === 'string' && delta.reasoning_content)
    out.push({ type: 'reasoning', text: delta.reasoning_content })
  if (typeof delta.reasoning === 'string' && delta.reasoning)
    out.push({ type: 'reasoning', text: delta.reasoning })
  if (payload.usage) {
    out.push({
      type: 'usage',
      usage: {
        in: payload.usage.prompt_tokens ?? null,
        out: payload.usage.completion_tokens ?? null,
      },
    })
  }
  return out
}

/* ------------------------------------------------------------- mode demo */

function demoReply(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || ''
  const short = last.length > 160 ? last.slice(0, 160) + '…' : last
  return `Halo! Kamu sedang memakai **Mode Demo** CikitoAI — jawaban ini dibuat secara lokal, **tanpa API key**, hanya untuk mencoba tampilannya.

Pertanyaan kamu tadi:
> ${short || '(kosong)'}

### Cara pakai model AI sungguhan
1. Klik ikon **gear** di header widget untuk membuka pengaturan.
2. Pilih penyedia (OpenAI, Claude, Gemini, Groq, OpenRouter, Ollama, atau **Kustom**).
3. Tempel **API key** dan ketik **nama model apa pun** — kolomnya bebas diisi.
4. Tekan **Jalankan**, lalu ngobrol seperti biasa.

Widget ini juga mendukung:

| Fitur | Cara pakai |
| --- | --- |
| Geser posisi | Tarik bubble atau header panel |
| Ubah ukuran | Tarik tepi / sudut panel, atau tekan tombol ukuran |
| Buka–tutup | Klik bubble, tombol minimize, atau tekan \`Esc\` |

\`\`\`js
// Contoh blok kode — lengkap dengan tombol salin
const cikito = { draggable: true, resizable: true, responsive: true }
console.log('Siap dipakai:', Object.keys(cikito).join(', '))
\`\`\`

Selamat mencoba! 🚀`
}

async function handleDemoStream(res, body) {
  sseInit(res)
  const text = demoReply(body.messages || [])
  // Pecah jadi token-token kecil supaya terasa seperti streaming sungguhan.
  const tokens = text.match(/\s*\S+/g) || [text]
  for (const tok of tokens) {
    if (res.writableEnded) return
    sseSend(res, { type: 'delta', text: tok })
    await new Promise((r) => setTimeout(r, 12))
  }
  sseSend(res, { type: 'usage', usage: { in: 0, out: tokens.length } })
  sseSend(res, { type: 'done' })
  res.end()
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

async function handleChat(req, res, body) {
  const kind = body.kind || 'openai'

  if (kind === 'demo') return handleDemoStream(res, body)

  if (!body.model) return json(res, 400, { error: 'Nama model belum diisi.' })
  if (!body.apiKey && !/localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/.test(body.baseUrl || '')) {
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

  let sawAnyText = false
  try {
    if (!upstream.body) throw new Error('Penyedia tidak mengirim body.')
    for await (const line of iterateLines(upstream.body)) {
      if (res.writableEnded) break
      if (!line || line.startsWith(':') || line.startsWith('event:') || line.startsWith('id:')) continue
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') continue
      let payload
      try {
        payload = JSON.parse(data)
      } catch {
        continue
      }
      if (payload?.error) {
        sseSend(res, {
          type: 'error',
          message: payload.error.message || 'Penyedia mengirim error di tengah aliran data.',
        })
        continue
      }
      for (const ev of normalizeChunk(kind, payload)) {
        if (ev.type === 'delta') sawAnyText = true
        sseSend(res, ev)
      }
    }
    if (!sawAnyText) {
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
  const apiKey = body.apiKey || ''
  const baseUrl = body.baseUrl || ''

  if (kind === 'demo') {
    return json(res, 200, { models: [{ id: 'cikito-demo', label: 'CikitoAI Demo (lokal)' }] })
  }

  let url
  let headers = {}
  if (kind === 'anthropic') {
    url = joinUrl(baseUrl || 'https://api.anthropic.com', '/v1/models?limit=100')
    headers = { 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION }
  } else if (kind === 'gemini') {
    url = joinUrl(baseUrl || 'https://generativelanguage.googleapis.com', '/v1beta/models?pageSize=200')
    headers = { 'x-goog-api-key': apiKey }
  } else {
    url = joinUrl(baseUrl || 'https://api.openai.com/v1', '/models')
    headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const r = await fetch(url, { headers, signal: controller.signal })
    const text = await r.text()
    if (!r.ok) return json(res, 502, { error: humanizeUpstreamError(r.status, text) })
    const data = JSON.parse(text)

    let models = []
    if (kind === 'gemini') {
      models = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).some((s) => /generateContent/i.test(s)))
        .map((m) => ({
          id: String(m.name || '').replace(/^models\//, ''),
          label: m.displayName || undefined,
        }))
    } else if (kind === 'anthropic') {
      models = (data.data || []).map((m) => ({ id: m.id, label: m.display_name || undefined }))
    } else {
      const list = data.data || data.models || []
      models = list.map((m) => ({ id: m.id || m.name, label: m.name && m.id ? undefined : undefined }))
    }

    models = models.filter((m) => m.id).sort((a, b) => a.id.localeCompare(b.id))
    return json(res, 200, { models })
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

  // CORS: widget bisa ditempel di halaman lain.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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
