/**
 * Inti penerjemah penyedia AI — ESM murni tanpa dependensi.
 *
 * Dipakai bersama oleh TIGA lingkungan berbeda:
 *   1. Backend Node    (server/api.mjs)              → proxy /api/chat
 *   2. Browser         (src/lib/direct.ts)           → mode langsung tanpa backend
 *   3. Service worker  (extension/background.js)     → ekstensi peramban
 *
 * Tugasnya menyatukan tiga bentuk API menjadi satu aliran event seragam:
 *   { type: 'delta' | 'reasoning' | 'usage' | 'notice' | 'error' | 'done' }
 */

export const ANTHROPIC_VERSION = '2023-06-01'

export const DEFAULT_BASE = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  gemini: 'https://generativelanguage.googleapis.com',
}

/* ------------------------------------------------------------------ utils */

export function stripSlash(url = '') {
  return String(url).trim().replace(/\/+$/, '')
}

/** Gabungkan base URL + path tanpa menduplikasi segmen (mis. /v1/v1). */
export function joinUrl(base, path) {
  const b = stripSlash(base)
  const p = String(path).replace(/^\/+/, '')
  const segs = p.split('/')
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

export function isLocalUrl(url = '') {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/.test(url)
}

/** Pesan error yang enak dibaca dari respons penyedia. */
export function humanizeUpstreamError(status, text) {
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

export function buildUpstreamRequest(cfg, { stream = true } = {}) {
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
    /** true bila permintaan dikirim langsung dari browser (butuh header khusus di Anthropic). */
    browser = false,
  } = cfg

  const clean = messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim() !== '')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

  if (kind === 'anthropic') {
    return {
      url: joinUrl(baseUrl || DEFAULT_BASE.anthropic, '/v1/messages'),
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          ...(browser ? { 'anthropic-dangerous-direct-browser-access': 'true' } : {}),
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
    const base = baseUrl || DEFAULT_BASE.gemini
    const method = stream ? 'streamGenerateContent' : 'generateContent'
    const url =
      joinUrl(base, `/v1beta/models/${encodeURIComponent(model)}:${method}`) +
      (stream ? '?alt=sse' : '')
    return {
      url,
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey, ...extraHeaders },
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
    url: joinUrl(baseUrl || DEFAULT_BASE.openai, '/chat/completions'),
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

export function buildModelsRequest({ kind = 'openai', baseUrl = '', apiKey = '' }) {
  if (kind === 'anthropic') {
    return {
      url: joinUrl(baseUrl || DEFAULT_BASE.anthropic, '/v1/models?limit=100'),
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    }
  }
  if (kind === 'gemini') {
    return {
      url: joinUrl(baseUrl || DEFAULT_BASE.gemini, '/v1beta/models?pageSize=200'),
      headers: { 'x-goog-api-key': apiKey },
    }
  }
  return {
    url: joinUrl(baseUrl || DEFAULT_BASE.openai, '/models'),
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
  }
}

export function parseModelsResponse(kind, data) {
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
    models = list.map((m) => ({ id: m.id || m.name }))
  }
  return models.filter((m) => m.id).sort((a, b) => a.id.localeCompare(b.id))
}

/* ------------------------------------------------------- pengurai stream */

/**
 * Ubah ReadableStream (web, tersedia di Node 18+ maupun browser) menjadi
 * iterator baris teks.
 */
export async function* iterateLines(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx
      while ((idx = buffer.indexOf('\n')) !== -1) {
        yield buffer.slice(0, idx).replace(/\r$/, '')
        buffer = buffer.slice(idx + 1)
      }
    }
    buffer += decoder.decode()
    if (buffer) yield buffer
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* abaikan */
    }
  }
}

/** Terjemahkan satu potongan JSON dari penyedia → daftar event ternormalisasi. */
export function normalizeChunk(kind, payload) {
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
        usage: { in: payload.usage.input_tokens ?? null, out: payload.usage.output_tokens ?? null },
      })
    } else if (t === 'error') {
      out.push({
        type: 'error',
        message: payload.error?.message || 'Terjadi kesalahan pada penyedia.',
      })
    }
    return out
  }

  if (kind === 'gemini') {
    const cand = payload.candidates?.[0]
    for (const p of cand?.content?.parts || []) {
      if (typeof p.text === 'string' && p.text)
        out.push({ type: p.thought ? 'reasoning' : 'delta', text: p.text })
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
    if (cand?.finishReason && cand.finishReason !== 'STOP')
      out.push({ type: 'notice', message: `Model berhenti dengan alasan: ${cand.finishReason}` })
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
      usage: { in: payload.usage.prompt_tokens ?? null, out: payload.usage.completion_tokens ?? null },
    })
  }
  return out
}

/**
 * Baca body SSE dari penyedia lalu panggil onEvent untuk tiap event ternormalisasi.
 * Mengembalikan true bila ada teks yang benar-benar diterima.
 */
export async function pumpProviderStream(kind, body, onEvent) {
  let sawText = false
  for await (const line of iterateLines(body)) {
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
      onEvent({
        type: 'error',
        message: payload.error.message || 'Penyedia mengirim error di tengah aliran data.',
      })
      continue
    }
    for (const ev of normalizeChunk(kind, payload)) {
      if (ev.type === 'delta') sawText = true
      onEvent(ev)
    }
  }
  return sawText
}

/* ------------------------------------------------------------- mode demo */

export function demoReply(messages = []) {
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

Widget ini juga bisa dibawa ke mana-mana:

| Cara | Keterangan |
| --- | --- |
| Jendela mengambang | Tombol "keluarkan" bikin widget melayang di atas aplikasi lain |
| Tempel di website | Satu baris \`<script>\` untuk website mana pun |
| Bookmarklet | Munculkan widget di website siapa pun lewat bookmark |
| Ekstensi peramban | Bubble mengikuti kamu di semua tab |

\`\`\`js
// Contoh blok kode — lengkap dengan tombol salin
const cikito = { draggable: true, resizable: true, portable: true }
console.log('Siap dipakai:', Object.keys(cikito).join(', '))
\`\`\`

Selamat mencoba! 🚀`
}

/** Pecah teks menjadi token kecil supaya terasa seperti streaming sungguhan. */
export function tokenizeForDemo(text) {
  return text.match(/\s*\S+/g) || [text]
}
