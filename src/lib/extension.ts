/**
 * Jalur khusus ekstensi peramban.
 *
 * Di Manifest V3, permintaan lintas-origin dari content script tetap terkena
 * CORS. Karena itu permintaan dikirim ke service worker ekstensi (yang punya
 * host_permissions) lewat port, lalu hasilnya dialirkan balik sebagai event
 * yang bentuknya sama persis dengan mode proxy/direct.
 */
import type { AIConfig, ChatMessage, StreamEvent } from '../types'

interface ChromePort {
  postMessage: (msg: unknown) => void
  disconnect: () => void
  onMessage: { addListener: (fn: (msg: StreamEvent) => void) => void }
  onDisconnect: { addListener: (fn: () => void) => void }
}

interface ChromeLike {
  runtime?: {
    connect?: (info: { name: string }) => ChromePort
    sendMessage?: (msg: unknown) => Promise<unknown>
    lastError?: { message?: string }
  }
}

function chromeApi(): ChromeLike['runtime'] | undefined {
  return (globalThis as unknown as { chrome?: ChromeLike }).chrome?.runtime
}

function toWire(messages: ChatMessage[]) {
  return messages
    .filter((m) => !m.error && m.content.trim() !== '')
    .map((m) => ({ role: m.role, content: m.content }))
}

export function streamExtension({
  config,
  messages,
  signal,
  onEvent,
}: {
  config: AIConfig
  messages: ChatMessage[]
  signal: AbortSignal
  onEvent: (event: StreamEvent) => void
}): Promise<void> {
  const runtime = chromeApi()
  if (!runtime?.connect) {
    onEvent({ type: 'error', message: 'API ekstensi tidak tersedia di konteks ini.' })
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const port = runtime.connect!({ name: 'cikito-chat' })
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', onAbort)
      resolve()
    }
    const onAbort = () => {
      try {
        port.disconnect()
      } catch {
        /* abaikan */
      }
      finish()
    }
    signal.addEventListener('abort', onAbort)

    port.onMessage.addListener((ev) => {
      onEvent(ev)
      if (ev.type === 'done') {
        try {
          port.disconnect()
        } catch {
          /* abaikan */
        }
        finish()
      }
    })
    port.onDisconnect.addListener(finish)

    port.postMessage({
      type: 'chat',
      payload: {
        kind: config.kind,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        system: config.system,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        messages: toWire(messages),
      },
    })
  })
}

export async function fetchModelsExtension(
  config: AIConfig,
): Promise<{ id: string; label?: string }[]> {
  const runtime = chromeApi()
  if (!runtime?.sendMessage) throw new Error('API ekstensi tidak tersedia di konteks ini.')
  const res = (await runtime.sendMessage({
    type: 'models',
    payload: { kind: config.kind, baseUrl: config.baseUrl, apiKey: config.apiKey },
  })) as { models?: { id: string; label?: string }[]; error?: string }
  if (res?.error) throw new Error(res.error)
  return res?.models ?? []
}
