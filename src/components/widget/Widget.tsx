import { useCallback, useEffect, useRef, useState } from 'react'
import { Settings2, SquarePen } from 'lucide-react'
import type { AIConfig, PanelView, Point, WidgetStage } from '../../types'
import { PROVIDER_MAP, defaultConfig, isConfigReady } from '../../lib/providers'
import { KEYS, loadJSON, loadRaw, saveJSON } from '../../lib/storage'
import { clamp } from '../../lib/utils'
import { useChat } from '../../hooks/useChat'
import { useMediaQuery, useViewport } from '../../hooks/useMediaQuery'
import { IconButton } from '../ui'
import { Bubble } from './Bubble'
import { ChatView } from './ChatView'
import { MARGIN, MIN_H, MIN_W, Panel, type Geometry } from './Panel'
import { SetupView } from './SetupView'

const BUBBLE_SIZE = 60
const GAP = 14

interface Props {
  stage: WidgetStage
  onStageChange: (stage: WidgetStage) => void
}

export function Widget({ stage, onStageChange }: Props) {
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
        onDismiss={close}
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
      onClose={close}
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
