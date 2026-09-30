/**
 * Mode langsung: browser memanggil API penyedia tanpa lewat backend CikitoAI.
 * Dipakai saat widget ditempel di website lain tanpa backend, atau di ekstensi.
 *
 * Logika penerjemahan penyedia dibagi dengan backend lewat shared/ai-core.mjs.
 */
import {
  buildModelsRequest,
  buildUpstreamRequest,
  demoReply,
  humanizeUpstreamError,
  parseModelsResponse,
  pumpProviderStream,
  tokenizeForDemo,
} from '../../shared/ai-core.mjs'
import type { AIConfig, ChatMessage, StreamEvent } from '../types'

export interface DirectOptions {
  config: AIConfig
  messages: ChatMessage[]
  signal: AbortSignal
  onEvent: (event: StreamEvent) => void
}

function toWire(messages: ChatMessage[]) {
  return messages
    .filter((m) => !m.error && m.content.trim() !== '')
    .map((m) => ({ role: m.role, content: m.content }))
}

async function runDemo({ messages, signal, onEvent }: DirectOptions) {
  const tokens = tokenizeForDemo(demoReply(toWire(messages)))
  for (const tok of tokens) {
    if (signal.aborted) return
    onEvent({ type: 'delta', text: tok })
    await new Promise((r) => setTimeout(r, 12))
  }
  onEvent({ type: 'usage', usage: { in: 0, out: tokens.length } })
  onEvent({ type: 'done' })
}

export async function streamDirect(opts: DirectOptions): Promise<void> {
  const { config, messages, signal, onEvent } = opts
  if (config.kind === 'demo') return runDemo(opts)

  const { url, init } = buildUpstreamRequest(
    {
      kind: config.kind,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      system: config.system,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      messages: toWire(messages),
      browser: true,
    },
    { stream: true },
  )

  let res: Response
  try {
    res = await fetch(url, { ...init, signal })
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return
    onEvent({
      type: 'error',
      message:
        `Tidak bisa menghubungi ${url} langsung dari browser. ` +
        'Penyedia ini mungkin memblokir panggilan lintas-origin (CORS). ' +
        'Gunakan backend CikitoAI (mode proxy) atau ekstensi peramban.\n\n' +
        ((err as Error)?.message ?? ''),
    })
    return
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    onEvent({ type: 'error', message: humanizeUpstreamError(res.status, text) })
    return
  }
  if (!res.body) {
    onEvent({ type: 'error', message: 'Penyedia tidak mengirim aliran data.' })
    return
  }

  try {
    const sawText = await pumpProviderStream(config.kind, res.body, onEvent)
    if (!sawText) {
      onEvent({
        type: 'notice',
        message: 'Model tidak mengirim teks apa pun (kemungkinan tersaring oleh filter keamanan).',
      })
    }
    onEvent({ type: 'done' })
  } catch (err) {
    if ((err as Error)?.name !== 'AbortError') {
      onEvent({ type: 'error', message: `Aliran data terputus: ${(err as Error)?.message ?? err}` })
    }
  }
}

export async function fetchModelsDirect(config: AIConfig): Promise<{ id: string; label?: string }[]> {
  if (config.kind === 'demo') return [{ id: 'cikito-demo', label: 'CikitoAI Demo (lokal)' }]
  const { url, headers } = buildModelsRequest({
    kind: config.kind,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  })
  const res = await fetch(url, { headers })
  const text = await res.text()
  if (!res.ok) throw new Error(humanizeUpstreamError(res.status, text))
  return parseModelsResponse(config.kind, JSON.parse(text))
}
