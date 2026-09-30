import { useCallback, useEffect, useRef, useState } from 'react'
import { Settings2, SquarePen } from 'lucide-react'
import type { AIConfig, PanelView, Point, WidgetStage } from '../../types'
import { PROVIDER_MAP, defaultConfig, isConfigReady } from '../../lib/providers'
import { KEYS, loadJSON, loadRaw, saveJSON } from '../../lib/storage'
import { getRuntime, popoutUrl } from '../../lib/runtime'
import { clamp, encodePayload } from '../../lib/utils'
import { useChat } from '../../hooks/useChat'
import { useMediaQuery, useViewport } from '../../hooks/useMediaQuery'
import { IconButton } from '../ui'
import { Bubble } from './Bubble'
import { ChatView } from './ChatView'
import { MARGIN, MIN_H, MIN_W, Panel, type Geometry } from './Panel'
import { SetupView } from './SetupView'

const BUBBLE_SIZE = 60
const GAP = 14

/** API Document Picture-in-Picture (Chrome/Edge 116+), belum ada di lib.dom. */
interface DocumentPiP {
  requestWindow: (opts?: { width?: number; height?: number }) => Promise<Window>
}

interface Props {
  stage: WidgetStage
  onStageChange: (stage: WidgetStage) => void
  /** Widget ditempel di website lain: tidak ada halaman induk untuk memanggilnya kembali. */
  embedded?: boolean
}

export function Widget({ stage, onStageChange, embedded = false }: Props) {
  const viewport = useViewport()
  const isMobile = useMediaQuery('(max-width: 767px)')

  const [config, setConfig] = useState<AIConfig>(() => loadJSON(KEYS.config, defaultConfig()))
  const [view, setView] = useState<PanelView>('setup')
  const [launched, setLaunched] = useState<boolean>(() => loadRaw(KEYS.seen, false))
  const [scale, setScale] = useState<number>(() => loadRaw(KEYS.scale, 1))
  const [maximized, setMaximized] = useState(false)

  const [bubble, setBubble] = useState<Point>(() =>
    loadRaw<Point>(KEYS.bubble, {
      x: window.innerWidth - BUBBLE_SIZE - 20,
      y: window.innerHeight - BUBBLE_SIZE - 20,
    }),
  )
  const [geometry, setGeometry] = useState<Geometry>(() =>
    loadRaw<Geometry>(KEYS.panel, { x: 0, y: 0, w: 420, h: 620 }),
  )
  const [animateGeo, setAnimateGeo] = useState(false)

  const anchoredRef = useRef(true)
  const chat = useChat(config)
  const ready = isConfigReady(config)
  const preset = PROVIDER_MAP[config.providerId]

  /* ------------------------------------------------------------ persistensi */
  useEffect(() => saveJSON(KEYS.config, config), [config])
  useEffect(() => saveJSON(KEYS.bubble, bubble), [bubble])
  useEffect(() => saveJSON(KEYS.scale, scale), [scale])
  useEffect(() => saveJSON(KEYS.seen, launched), [launched])
  useEffect(() => saveJSON(KEYS.panel, geometry), [geometry])

  /* -------------------------------------------- jaga posisi tetap di layar */
  useEffect(() => {
    setBubble((p) => ({
      x: clamp(p.x, 8, Math.max(8, viewport.w - BUBBLE_SIZE - 8)),
      y: clamp(p.y, 8, Math.max(8, viewport.h - BUBBLE_SIZE - 8)),
    }))
    setGeometry((g) => {
      const w = clamp(g.w, MIN_W, Math.max(MIN_W, viewport.w - MARGIN * 2))
      const h = clamp(g.h, MIN_H, Math.max(MIN_H, viewport.h - MARGIN * 2))
      return {
        w,
        h,
        x: clamp(g.x, MARGIN, Math.max(MARGIN, viewport.w - w - MARGIN)),
        y: clamp(g.y, MARGIN, Math.max(MARGIN, viewport.h - h - MARGIN)),
      }
    })
  }, [viewport.w, viewport.h])

  /* ------------------------------------- tempelkan panel di dekat bubble */
  const anchorPanel = useCallback(
    (from: Point) => {
      setGeometry((g) => {
        const w = clamp(g.w, MIN_W, Math.max(MIN_W, viewport.w - MARGIN * 2))
        const h = clamp(g.h, MIN_H, Math.max(MIN_H, viewport.h - MARGIN * 2))
        const onRight = from.x + BUBBLE_SIZE / 2 > viewport.w / 2
        let x = onRight ? from.x + BUBBLE_SIZE - w : from.x
        let y = from.y - h - GAP
        if (y < MARGIN) y = Math.min(from.y + BUBBLE_SIZE + GAP, viewport.h - h - MARGIN)
        x = clamp(x, MARGIN, Math.max(MARGIN, viewport.w - w - MARGIN))
        y = clamp(y, MARGIN, Math.max(MARGIN, viewport.h - h - MARGIN))
        return { x, y, w, h }
      })
    },
    [viewport.w, viewport.h],
  )

  /* ----------------------------------------------------------- aksi utama */
  const openPanel = useCallback(() => {
    if (anchoredRef.current) anchorPanel(bubble)
    setView(launched && ready ? 'chat' : 'setup')
    onStageChange('panel')
  }, [anchorPanel, bubble, launched, ready, onStageChange])

  const minimize = useCallback(() => onStageChange('bubble'), [onStageChange])
  const close = useCallback(() => onStageChange('hidden'), [onStageChange])

  /**
   * Lepas panel menjadi jendela mengambang sungguhan — tetap tampil di atas
   * aplikasi lain (Document Picture-in-Picture), atau jendela popup biasa.
   * Konfigurasi dikirim lewat hash URL, jadi tidak pernah sampai ke server.
   */
  const popOut = useCallback(async () => {
    const rt = getRuntime()
    const url = `${popoutUrl()}#cfg=${encodePayload({
      config,
      scale,
      theme: rt.theme,
      // Ekstensi memakai jembatan service worker yang tidak ada di halaman biasa.
      transport: rt.transport === 'extension' ? 'direct' : rt.transport,
      storagePrefix: rt.storagePrefix,
    })}`
    const w = Math.round(clamp(geometry.w, 360, 720))
    const h = Math.round(clamp(geometry.h, 420, 900))

    const dpip = (window as unknown as { documentPictureInPicture?: DocumentPiP })
      .documentPictureInPicture

    if (dpip?.requestWindow) {
      try {
        const pip = await dpip.requestWindow({ width: w, height: h })
        pip.document.title = 'CikitoAI'
        pip.document.body.style.cssText = 'margin:0;background:#0b0b12;overflow:hidden'
        const frame = pip.document.createElement('iframe')
        frame.src = url
        frame.allow = 'clipboard-write'
        frame.setAttribute('title', 'CikitoAI')
        frame.style.cssText = 'display:block;border:0;width:100%;height:100vh'
        pip.document.body.appendChild(frame)
        minimize()
        return
      } catch {
        /* pengguna membatalkan atau browser menolak — pakai jendela biasa */
      }
    }

    const popup = window.open(
      url,
      'cikitoai-popout',
      `popup=yes,width=${w},height=${h},left=${Math.max(0, screen.availWidth - w - 40)},top=90`,
    )
    if (popup) {
      popup.focus()
      minimize()
    }
  }, [config, scale, geometry.w, geometry.h, minimize])

  const handleRun = useCallback(() => {
    setLaunched(true)
    setView('chat')
  }, [])

  /* ------------------------------------------------ pintasan papan ketik */
  useEffect(() => {
    if (stage !== 'panel') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        minimize()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, minimize])

  /* Petunjuk singkat saat bubble pertama kali muncul */
  const [showHint, setShowHint] = useState(false)
  useEffect(() => {
    if (stage !== 'bubble' || launched) {
      setShowHint(false)
      return
    }
    setShowHint(true)
    const t = window.setTimeout(() => setShowHint(false), 7000)
    return () => window.clearTimeout(t)
  }, [stage, launched])

  /* Kunci scroll halaman saat bottom-sheet terbuka di mobile */
  useEffect(() => {
    if (!isMobile) return
    const open = stage === 'panel'
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, stage])

  /* --------------------------------------------------------------- render */
  if (stage === 'hidden') return null

  if (stage === 'bubble') {
    return (
      <Bubble
        pos={bubble}
        size={BUBBLE_SIZE}
        hint={showHint}
        attention={!launched}
        viewportWidth={viewport.w}
        onMove={setBubble}
        onDragEnd={(p) => {
          // Tempel ke tepi kiri/kanan terdekat.
          const snapX =
            p.x + BUBBLE_SIZE / 2 > viewport.w / 2 ? viewport.w - BUBBLE_SIZE - 16 : 16
          const next = {
            x: snapX,
            y: clamp(p.y, 16, Math.max(16, viewport.h - BUBBLE_SIZE - 16)),
          }
          setBubble(next)
          anchoredRef.current = true
        }}
        onOpen={openPanel}
        onDismiss={embedded ? undefined : close}
      />
    )
  }

  const statusText =
    view === 'setup'
      ? 'Atur koneksi model AI'
      : chat.isStreaming
        ? 'Sedang mengetik…'
        : config.kind === 'demo'
          ? 'Mode Demo · tanpa API key'
          : `${preset?.name ?? 'Kustom'} · ${config.model}`

  const compact = isMobile ? viewport.w < 400 : !maximized && geometry.w < 390

  /**
   * Pop-out butuh halaman CikitoAI yang bisa dibuka di jendela lain. Saat
   * ditempel di situs lain, itu hanya mungkin bila asal backend diketahui.
   */
  const runtime = getRuntime()
  const canPopOut = !runtime.popout && (!runtime.embedded || !!runtime.apiBase)

  return (
    <Panel
      geometry={geometry}
      onGeometryChange={(g, opts) => {
        if (opts?.animate) {
          setAnimateGeo(true)
          window.setTimeout(() => setAnimateGeo(false), 260)
        } else {
          anchoredRef.current = false
        }
        setGeometry(g)
      }}
      maximized={maximized}
      onToggleMaximize={() => setMaximized((v) => !v)}
      scale={scale}
      onScaleChange={setScale}
      isMobile={isMobile}
      viewport={viewport}
      title="CikitoAI"
      status={statusText}
      statusTone={chat.isStreaming ? 'busy' : ready && launched ? 'ok' : 'warn'}
      headerExtras={
        view === 'chat' ? (
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
        ) : null
      }
      onMinimize={minimize}
      onClose={embedded ? minimize : close}
      closeLabel={embedded ? 'Tutup obrolan' : 'Tutup widget'}
      onPopOut={canPopOut ? popOut : undefined}
      animate={animateGeo}
    >
      {view === 'setup' ? (
        <SetupView
          config={config}
          onChange={setConfig}
          onRun={handleRun}
          onBack={launched && ready ? () => setView('chat') : undefined}
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
    </Panel>
  )
}
