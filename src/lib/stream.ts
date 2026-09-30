import type { AIConfig, ChatMessage, StreamEvent } from '../types'
import { apiUrl, getRuntime } from './runtime'
import { fetchModelsDirect, streamDirect } from './direct'
import { fetchModelsExtension, streamExtension } from './extension'

export interface StreamOptions {
  config: AIConfig
  messages: ChatMessage[]
  signal: AbortSignal
  onEvent: (event: StreamEvent) => void
}

/** Backend CikitoAI tidak terjangkau (bukan error dari penyedia AI). */
class ProxyUnavailable extends Error {}

function toWire(messages: ChatMessage[]) {
  return messages
    .filter((m) => !m.error && m.content.trim() !== '')
    .map((m) => ({ role: m.role, content: m.content }))
}

function payload(config: AIConfig, messages: ChatMessage[]) {
  return {
    kind: config.kind,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    system: config.system,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    messages: toWire(messages),
  }
}

/* ------------------------------------------------------------ via backend */

async function streamProxy({ config, messages, signal, onEvent }: StreamOptions) {
  let res: Response
  try {
    res = await fetch(apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify(payload(config, messages)),
    })
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return
    throw new ProxyUnavailable((err as Error)?.message ?? 'jaringan gagal')
  }

  if (res.status === 404 || res.status === 405 || res.status === 501) {
    throw new ProxyUnavailable(`backend membalas ${res.status}`)
  }

  if (!res.ok || !res.headers.get('content-type')?.includes('text/event-stream')) {
    let message = `Permintaan gagal (HTTP ${res.status}).`
    try {
      const data = await res.json()
      if (data?.error) message = String(data.error)
    } catch {
      /* biarkan pesan default */
    }
    onEvent({ type: 'error', message })
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    onEvent({ type: 'error', message: 'Browser tidak mendukung streaming respons.' })
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (!data) continue
        try {
          onEvent(JSON.parse(data) as StreamEvent)
        } catch {
          /* lewati potongan rusak */
        }
      }
    }
  }
}

/* ----------------------------------------------------------- dispatcher */

/**
 * Kirim percakapan lalu terima balasan sebagai aliran event ternormalisasi.
 * Jalur pengiriman mengikuti runtime: proxy / direct / auto / extension.
 */
export async function streamChat(opts: StreamOptions): Promise<void> {
  const { transport } = getRuntime()

  if (transport === 'extension') return streamExtension(opts)
  if (transport === 'direct') return streamDirect(opts)

  try {
    await streamProxy(opts)
  } catch (err) {
    if (err instanceof ProxyUnavailable) {
      if (transport === 'auto') return streamDirect(opts)
      opts.onEvent({
        type: 'error',
        message:
          'Backend CikitoAI tidak bisa dihubungi. Pastikan server berjalan, ' +
          `atau pakai mode langsung (transport="direct").\n\n${err.message}`,
      })
      return
    }
    throw err
  }
}

/* -------------------------------------------------------------- utilitas */

export async function fetchModels(config: AIConfig): Promise<{ id: string; label?: string }[]> {
  const { transport } = getRuntime()
  if (transport === 'extension') return fetchModelsExtension(config)
  if (transport === 'direct') return fetchModelsDirect(config)

  try {
    const res = await fetch(apiUrl('/api/models'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: config.kind, baseUrl: config.baseUrl, apiKey: config.apiKey }),
    })
    if (res.status === 404 && transport === 'auto') return fetchModelsDirect(config)
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || `Gagal memuat daftar model (HTTP ${res.status}).`)
    return data.models ?? []
  } catch (err) {
    if (transport === 'auto') return fetchModelsDirect(config)
    throw err
  }
}

/** Uji koneksi cepat: kirim satu pesan pendek tanpa menampilkannya di chat. */
export async function testConnection(config: AIConfig): Promise<{ ok: boolean; message: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 45_000)
  let text = ''
  let error = ''

  try {
    await streamChat({
      config: { ...config, maxTokens: 64 },
      messages: [
        { id: 'probe', role: 'user', content: 'Balas persis satu kata: OK', createdAt: Date.now() },
      ],
      signal: controller.signal,
      onEvent: (ev) => {
        if (ev.type === 'delta') text += ev.text ?? ''
        if (ev.type === 'error') error = ev.message ?? 'Terjadi kesalahan.'
      },
    })
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  } finally {
    clearTimeout(timer)
  }

  if (error) return { ok: false, message: error }
  if (!text.trim())
    return { ok: false, message: 'Terhubung, tetapi model tidak mengirim teks apa pun.' }
  return { ok: true, message: `Berhasil! Model membalas: "${text.trim().slice(0, 60)}"` }
}
