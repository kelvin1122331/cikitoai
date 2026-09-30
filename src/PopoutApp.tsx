/**
 * Halaman popout — dipakai saat panel "dilepas" menjadi jendela mengambang
 * (Document Picture-in-Picture) atau jendela popup terpisah.
 *
 * Dibuka lewat /?cikito=popout. Konfigurasi dititipkan pada hash URL
 * (#cfg=…) sehingga API key tidak pernah ikut terkirim ke server, lalu hash
 * langsung dihapus dari address bar.
 */
import { useEffect, useMemo, useState } from 'react'
import { Settings2, Sparkles, SquarePen, X } from 'lucide-react'
import type { AIConfig, PanelView } from './types'
import { PROVIDER_MAP, defaultConfig, isConfigReady } from './lib/providers'
import { KEYS, loadJSON, loadRaw, saveJSON } from './lib/storage'
import { decodePayload, fontPx } from './lib/utils'
import { setRuntime, type Transport } from './lib/runtime'
import { useChat } from './hooks/useChat'
import { useViewport } from './hooks/useMediaQuery'
import { IconButton } from './components/ui'
import { ChatView } from './components/widget/ChatView'
import { SetupView } from './components/widget/SetupView'

interface Handoff {
  config?: AIConfig
  scale?: number
  theme?: 'light' | 'dark'
  transport?: Transport
  storagePrefix?: string
}

function readHandoff(): Handoff {
  if (typeof location === 'undefined' || !location.hash) return {}
  const raw = new URLSearchParams(location.hash.replace(/^#/, '')).get('cfg')
  if (!raw) return {}
  const data = decodePayload<Handoff>(raw) ?? {}
  setRuntime({
    popout: true,
    transport: data.transport ?? 'proxy',
    storagePrefix: data.storagePrefix || 'cikito.',
  })
  // Bersihkan hash supaya API key tidak tertinggal di address bar / riwayat.
  history.replaceState(null, '', location.pathname + location.search)
  return data
}

export default function PopoutApp() {
  const handoff = useMemo(readHandoff, [])
  const viewport = useViewport()

  const [config, setConfig] = useState<AIConfig>(
    () => handoff.config ?? loadJSON(KEYS.config, defaultConfig()),
  )
  const [scale] = useState<number>(() => handoff.scale ?? loadRaw(KEYS.scale, 1))
  const ready = isConfigReady(config)
  const [view, setView] = useState<PanelView>(ready ? 'chat' : 'setup')
  const chat = useChat(config)
  const preset = PROVIDER_MAP[config.providerId]

  useEffect(() => {
    setRuntime({ popout: true })
  }, [])
  useEffect(() => saveJSON(KEYS.config, config), [config])

  /* Tema: ikut titipan jendela induk, lalu localStorage, lalu preferensi sistem. */
  useEffect(() => {
    const stored = handoff.theme ?? loadRaw<'light' | 'dark' | null>(KEYS.theme, null)
    const dark = stored
      ? stored === 'dark'
      : window.matchMedia?.('(prefers-color-scheme: dark)').matches !== false
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    document.title = 'CikitoAI — Asisten'
  }, [handoff.theme])

  const compact = viewport.w < 400
  const status =
    view === 'setup'
      ? 'Atur koneksi model AI'
      : chat.isStreaming
        ? 'Sedang mengetik…'
        : config.kind === 'demo'
          ? 'Mode Demo · tanpa API key'
          : `${preset?.name ?? 'Kustom'} · ${config.model}`

  return (
    <div
      className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white text-ink-900 dark:bg-ink-950 dark:text-white"
      style={{ fontSize: fontPx(scale) }}
    >
      <header className="relative flex shrink-0 items-center gap-2 border-b border-black/[0.07] bg-gradient-to-r from-brand-500/[0.07] via-transparent to-cyan-500/[0.07] px-2.5 py-2 dark:border-white/[0.08]">
        <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 flex-1 select-none">
          <h1 className="truncate text-[0.9em] leading-tight font-bold">CikitoAI</h1>
          <p className="truncate text-[0.68em] leading-tight text-ink-500 dark:text-ink-400">
            {status}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {view === 'chat' && (
            <>
              {!compact && (
                <IconButton
                  onClick={chat.clear}
                  aria-label="Obrolan baru"
                  title="Obrolan baru"
                  className="size-7"
                  disabled={chat.messages.length === 0}
                >
                  <SquarePen className="size-4" />
                </IconButton>
              )}
              <IconButton
                onClick={() => setView('setup')}
                aria-label="Pengaturan API"
                title="Pengaturan API"
                className="size-7"
              >
                <Settings2 className="size-4" />
              </IconButton>
            </>
          )}
          <IconButton
            onClick={() => window.close()}
            tone="danger"
            aria-label="Tutup jendela"
            title="Tutup jendela"
            className="size-7"
          >
            <X className="size-4" />
          </IconButton>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {view === 'setup' ? (
          <SetupView
            config={config}
            onChange={setConfig}
            onRun={() => setView('chat')}
            onBack={ready ? () => setView('chat') : undefined}
            compact={compact}
          />
        ) : (
          <ChatView
            config={config}
            chat={chat}
            onOpenSettings={() => setView('setup')}
            compact={compact}
          />
        )}
      </div>
    </div>
  )
}
