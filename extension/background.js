/**
 * Service worker CikitoAI (Manifest V3).
 *
 * Dua tugas:
 *  1. Menyuntikkan widget ke tab aktif saat ikon ekstensi diklik.
 *  2. Menjadi jembatan jaringan. Content script MV3 tetap terkena CORS,
 *     sedangkan service worker punya host_permissions <all_urls> sehingga
 *     bisa memanggil API penyedia mana pun tanpa backend.
 *
 * Event yang dikirim balik ke halaman memakai bentuk yang sama persis dengan
 * backend CikitoAI: {type:'delta'|'reasoning'|'usage'|'notice'|'error'|'done'}.
 */
import {
  buildModelsRequest,
  buildUpstreamRequest,
  demoReply,
  humanizeUpstreamError,
  parseModelsResponse,
  pumpProviderStream,
  tokenizeForDemo,
} from './ai-core.mjs'

/* ------------------------------------------------- suntik widget ke halaman */

async function toggleOnTab(tab) {
  if (!tab?.id) return
  if (/^(chrome|edge|about|chrome-extension|moz-extension):/i.test(tab.url || '')) {
    return // halaman internal peramban tidak bisa disuntik
  }

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'cikito-toggle' })
    if (res?.ok) return
  } catch {
    /* belum disuntik — lanjut ke executeScript */
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: false },
    files: ['boot.js', 'widget.js'],
    world: 'ISOLATED',
  })
}

chrome.action.onClicked.addListener((tab) => {
  toggleOnTab(tab).catch((err) => console.error('[CikitoAI]', err))
})

/* ------------------------------------------------------ jembatan streaming */

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'cikito-chat') return

  const controller = new AbortController()
  let closed = false
  const send = (event) => {
    if (closed) return
    try {
      port.postMessage(event)
    } catch {
      closed = true
    }
  }

  port.onDisconnect.addListener(() => {
    closed = true
    controller.abort()
  })

  port.onMessage.addListener(async (msg) => {
    if (msg?.type !== 'chat') return
    const cfg = msg.payload || {}

    try {
      if (cfg.kind === 'demo') {
        const tokens = tokenizeForDemo(demoReply(cfg.messages || []))
        for (const tok of tokens) {
          if (closed) return
          send({ type: 'delta', text: tok })
          await new Promise((r) => setTimeout(r, 12))
        }
        send({ type: 'usage', usage: { in: 0, out: tokens.length } })
        send({ type: 'done' })
        return
      }

      const { url, init } = buildUpstreamRequest(cfg, { stream: true })
      const res = await fetch(url, { ...init, signal: controller.signal })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        send({ type: 'error', message: humanizeUpstreamError(res.status, text) })
        send({ type: 'done' })
        return
      }
      if (!res.body) throw new Error('Penyedia tidak mengirim aliran data.')

      const sawText = await pumpProviderStream(cfg.kind, res.body, send)
      if (!sawText) {
        send({
          type: 'notice',
          message: 'Model tidak mengirim teks apa pun (kemungkinan tersaring filter keamanan).',
        })
      }
      send({ type: 'done' })
    } catch (err) {
      if (err?.name !== 'AbortError') {
        send({ type: 'error', message: `Gagal menghubungi penyedia: ${err?.message || err}` })
        send({ type: 'done' })
      }
    }
  })
})

/* --------------------------------------------------------- daftar model */

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== 'models') return
  const cfg = msg.payload || {}

  ;(async () => {
    if (cfg.kind === 'demo') {
      return { models: [{ id: 'cikito-demo', label: 'CikitoAI Demo (lokal)' }] }
    }
    const { url, headers } = buildModelsRequest(cfg)
    const res = await fetch(url, { headers })
    const text = await res.text()
    if (!res.ok) return { error: humanizeUpstreamError(res.status, text) }
    return { models: parseModelsResponse(cfg.kind, JSON.parse(text)) }
  })()
    .then(sendResponse)
    .catch((err) => sendResponse({ error: String(err?.message || err) }))

  return true // jawaban dikirim asinkron
})
