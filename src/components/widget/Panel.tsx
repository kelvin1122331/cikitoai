import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ChevronDown,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Minus,
  Monitor,
  Scaling,
  Smartphone,
  Sparkles,
  Tablet,
  X,
} from 'lucide-react'
import type { Size } from '../../types'
import { usePointerDrag } from '../../hooks/usePointerDrag'
import { cn, clamp } from '../../lib/utils'
import { IconButton } from '../ui'

export interface Geometry {
  x: number
  y: number
  w: number
  h: number
}

export const MIN_W = 300
export const MIN_H = 360
export const MARGIN = 8

export const SIZE_PRESETS: { id: string; label: string; icon: typeof Monitor; size: Size }[] = [
  { id: 'sm', label: 'Kecil', icon: Smartphone, size: { w: 340, h: 480 } },
  { id: 'md', label: 'Sedang', icon: Tablet, size: { w: 420, h: 620 } },
  { id: 'lg', label: 'Besar', icon: Monitor, size: { w: 560, h: 760 } },
]

interface Props {
  geometry: Geometry
  onGeometryChange: (g: Geometry, opts?: { animate?: boolean }) => void
  maximized: boolean
  onToggleMaximize: () => void
  scale: number
  onScaleChange: (s: number) => void
  isMobile: boolean
  viewport: Size
  title: string
  status: ReactNode
  statusTone: 'ok' | 'warn' | 'busy'
  headerExtras?: ReactNode
  onMinimize: () => void
  onClose: () => void
  /** Animasikan perpindahan/perubahan ukuran (mis. saat memakai preset). */
  animate?: boolean
  children: ReactNode
}

/* ------------------------------------------------------------ resize grip */

const CURSORS: Record<string, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}

function ResizeHandle({
  dir,
  geometry,
  onGeometryChange,
  viewport,
}: {
  dir: string
  geometry: Geometry
  onGeometryChange: (g: Geometry) => void
  viewport: Size
}) {
  const start = useRef<Geometry>(geometry)

  const drag = usePointerDrag({
    threshold: 1,
    cursor: CURSORS[dir],
    onStart: () => {
      start.current = geometry
    },
    onMove: (dx, dy) => {
      const s = start.current
      let { x, y, w, h } = s

      if (dir.includes('e')) w = clamp(s.w + dx, MIN_W, viewport.w - s.x - MARGIN)
      if (dir.includes('s')) h = clamp(s.h + dy, MIN_H, viewport.h - s.y - MARGIN)
      if (dir.includes('w')) {
        const nw = clamp(s.w - dx, MIN_W, s.x + s.w - MARGIN)
        x = s.x + s.w - nw
        w = nw
      }
      if (dir.includes('n')) {
        const nh = clamp(s.h - dy, MIN_H, s.y + s.h - MARGIN)
        y = s.y + s.h - nh
        h = nh
      }
      onGeometryChange({ x, y, w, h })
    },
  })

  const edge = dir.length === 1
  const pos: Record<string, string> = {
    n: 'top-0 left-3 right-3 h-1.5 -translate-y-1/2',
    s: 'bottom-0 left-3 right-3 h-1.5 translate-y-1/2',
    e: 'right-0 top-3 bottom-3 w-1.5 translate-x-1/2',
    w: 'left-0 top-3 bottom-3 w-1.5 -translate-x-1/2',
    ne: 'top-0 right-0 size-4 -translate-y-1/3 translate-x-1/3',
    nw: 'top-0 left-0 size-4 -translate-y-1/3 -translate-x-1/3',
    se: 'bottom-0 right-0 size-4 translate-y-1/3 translate-x-1/3',
    sw: 'bottom-0 left-0 size-4 translate-y-1/3 -translate-x-1/3',
  }

  return (
    <div
      {...drag}
      role="separator"
      aria-label={`Ubah ukuran dari sisi ${dir}`}
      className={cn(
        'absolute z-20 touch-none',
        pos[dir],
        edge ? 'rounded-full' : 'rounded-md',
        'hover:bg-brand-500/25',
      )}
      style={{ cursor: CURSORS[dir] }}
    />
  )
}

/* ------------------------------------------------------------------ panel */

export function Panel({
  geometry,
  onGeometryChange,
  maximized,
  onToggleMaximize,
  scale,
  onScaleChange,
  isMobile,
  viewport,
  title,
  status,
  statusTone,
  headerExtras,
  onMinimize,
  onClose,
  animate,
  children,
}: Props) {
  const start = useRef<Geometry>(geometry)
  const [sizeMenu, setSizeMenu] = useState(false)
  const [sheetOffset, setSheetOffset] = useState(0)
  const [morphing, setMorphing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const locked = maximized || isMobile

  /* Transisi halus ketika berpindah mode layar penuh */
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setMorphing(true)
    const t = window.setTimeout(() => setMorphing(false), 280)
    return () => window.clearTimeout(t)
  }, [maximized])

  /* Geser panel lewat header (desktop) */
  const headerDrag = usePointerDrag({
    cursor: 'grabbing',
    disabled: locked,
    onStart: () => {
      start.current = geometry
      setSizeMenu(false)
    },
    onMove: (dx, dy) => {
      const s = start.current
      onGeometryChange({
        ...s,
        x: clamp(s.x + dx, MARGIN, Math.max(MARGIN, viewport.w - s.w - MARGIN)),
        y: clamp(s.y + dy, MARGIN, Math.max(MARGIN, viewport.h - s.h - MARGIN)),
      })
    },
  })

  /* Tarik ke bawah untuk menutup (mobile) */
  const sheetDrag = usePointerDrag({
    threshold: 2,
    disabled: !isMobile,
    onMove: (_dx, dy) => setSheetOffset(Math.max(0, dy)),
    onEnd: ({ dy, moved }) => {
      if (moved && dy > 110) onMinimize()
      setSheetOffset(0)
    },
  })

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setSizeMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const applyPreset = (size: Size) => {
    const w = Math.min(size.w, viewport.w - MARGIN * 2)
    const h = Math.min(size.h, viewport.h - MARGIN * 2)
    onGeometryChange(
      {
        w,
        h,
        x: clamp(geometry.x, MARGIN, Math.max(MARGIN, viewport.w - w - MARGIN)),
        y: clamp(geometry.y, MARGIN, Math.max(MARGIN, viewport.h - h - MARGIN)),
      },
      { animate: true },
    )
    setSizeMenu(false)
  }

  const style: React.CSSProperties = isMobile
    ? {
        left: MARGIN,
        right: MARGIN,
        bottom: MARGIN,
        top: 'auto',
        height: `${Math.round(
          clamp(geometry.h, Math.min(viewport.h * 0.62, viewport.h - MARGIN * 2), viewport.h - MARGIN * 2),
        )}px`,
        transform: sheetOffset ? `translateY(${sheetOffset}px)` : undefined,
        transition: sheetOffset ? 'none' : 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
        fontSize: `${14 * scale}px`,
      }
    : maximized
      ? { inset: 16, fontSize: `${14 * scale}px` }
      : {
          left: geometry.x,
          top: geometry.y,
          width: geometry.w,
          height: geometry.h,
          fontSize: `${14 * scale}px`,
        }

  return (
    <div
      role="dialog"
      aria-label="Asisten CikitoAI"
      className={cn(
        'fixed z-[9999] flex animate-pop flex-col overflow-hidden',
        'rounded-2xl border border-black/[0.08] bg-white/90 shadow-panel backdrop-blur-2xl',
        'dark:border-white/[0.09] dark:bg-ink-950/85',
        'supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-ink-950/75',
        (animate || morphing) &&
          'transition-[left,top,right,bottom,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
      )}
      style={style}
    >
      {/* Aksen atas */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />

      {/* Grabber mobile */}
      {isMobile && (
        <div {...sheetDrag} className="flex cursor-grab touch-none justify-center pt-2 pb-1">
          <span className="h-1 w-10 rounded-full bg-ink-300 dark:bg-white/20" />
        </div>
      )}

      {/* Header */}
      <header
        {...headerDrag}
        onDoubleClick={() => !isMobile && onToggleMaximize()}
        className={cn(
          'relative flex shrink-0 items-center gap-2 border-b border-black/[0.07] px-2.5 py-2 dark:border-white/[0.08]',
          'bg-gradient-to-r from-brand-500/[0.07] via-transparent to-cyan-500/[0.07]',
          !locked && 'cursor-grab touch-none active:cursor-grabbing',
        )}
      >
        <div className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-sm">
          <Sparkles className="size-4" />
          <span
            className={cn(
              'absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white dark:border-ink-950',
              statusTone === 'ok' && 'bg-emerald-500',
              statusTone === 'warn' && 'bg-amber-500',
              statusTone === 'busy' && 'animate-pulse bg-brand-400',
            )}
          />
        </div>

        <div className="min-w-0 flex-1 select-none">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-[0.9em] leading-tight font-bold text-ink-900 dark:text-white">
              {title}
            </h2>
            {!locked && (
              <GripHorizontal className="size-3 shrink-0 text-ink-300 dark:text-ink-600" />
            )}
          </div>
          <p className="truncate text-[0.68em] leading-tight text-ink-500 dark:text-ink-400">
            {status}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {headerExtras}

          {/* Menu ukuran & skala */}
          <div className="relative" ref={menuRef}>
            <IconButton
              onClick={() => setSizeMenu((v) => !v)}
              active={sizeMenu}
              aria-label="Atur ukuran tampilan"
              title="Atur ukuran"
              className="size-7"
            >
              <Scaling className="size-4" />
            </IconButton>

            {sizeMenu && (
              <div className="absolute right-0 z-30 mt-1.5 w-52 animate-fade-in rounded-xl border border-black/10 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-ink-900">
                {!isMobile && (
                  <>
                    <p className="px-1 pb-1 text-[0.66em] font-bold tracking-wide text-ink-400 uppercase">
                      Ukuran panel
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {SIZE_PRESETS.map((p) => {
                        const Icon = p.icon
                        const active =
                          !maximized &&
                          Math.abs(geometry.w - p.size.w) < 24 &&
                          Math.abs(geometry.h - p.size.h) < 40
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyPreset(p.size)}
                            className={cn(
                              'flex flex-col items-center gap-1 rounded-lg border px-1 py-1.5 text-[0.62em] font-semibold transition',
                              active
                                ? 'border-brand-400 bg-brand-500/10 text-brand-600 dark:text-brand-300'
                                : 'border-black/10 text-ink-500 hover:bg-black/[0.04] dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/5',
                            )}
                          >
                            <Icon className="size-3.5" />
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleMaximize()
                        setSizeMenu(false)
                      }}
                      className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.7em] font-semibold text-ink-600 transition hover:bg-black/[0.04] dark:text-ink-300 dark:hover:bg-white/5"
                    >
                      {maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                      {maximized ? 'Kembalikan ukuran' : 'Layar penuh'}
                    </button>
                    <div className="my-1.5 h-px bg-black/[0.07] dark:bg-white/10" />
                  </>
                )}

                <p className="px-1 pb-1 text-[0.66em] font-bold tracking-wide text-ink-400 uppercase">
                  Skala teks · {Math.round(scale * 100)}%
                </p>
                <div className="flex items-center gap-1.5 px-1">
                  <button
                    type="button"
                    onClick={() => onScaleChange(clamp(+(scale - 0.1).toFixed(2), 0.8, 1.5))}
                    className="grid size-6 place-items-center rounded-md border border-black/10 text-[0.7em] font-bold hover:bg-black/[0.05] dark:border-white/10 dark:hover:bg-white/5"
                    aria-label="Perkecil teks"
                  >
                    A－
                  </button>
                  <input
                    type="range"
                    min={0.8}
                    max={1.5}
                    step={0.05}
                    value={scale}
                    onChange={(e) => onScaleChange(Number(e.target.value))}
                    className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600 dark:bg-white/15"
                    aria-label="Skala teks"
                  />
                  <button
                    type="button"
                    onClick={() => onScaleChange(clamp(+(scale + 0.1).toFixed(2), 0.8, 1.5))}
                    className="grid size-6 place-items-center rounded-md border border-black/10 text-[0.7em] font-bold hover:bg-black/[0.05] dark:border-white/10 dark:hover:bg-white/5"
                    aria-label="Perbesar teks"
                  >
                    A＋
                  </button>
                </div>
                {scale !== 1 && (
                  <button
                    type="button"
                    onClick={() => onScaleChange(1)}
                    className="mt-1.5 w-full rounded-lg px-2 py-1 text-[0.66em] font-semibold text-brand-600 hover:bg-brand-500/10 dark:text-brand-300"
                  >
                    Kembalikan ke 100%
                  </button>
                )}
              </div>
            )}
          </div>

          {!isMobile && (
            <IconButton
              onClick={onToggleMaximize}
              aria-label={maximized ? 'Kembalikan ukuran' : 'Layar penuh'}
              title={maximized ? 'Kembalikan ukuran' : 'Layar penuh'}
              className="size-7"
            >
              {maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </IconButton>
          )}

          <IconButton
            onClick={onMinimize}
            aria-label="Kecilkan ke bubble"
            title="Kecilkan"
            className="size-7"
          >
            {isMobile ? <ChevronDown className="size-4" /> : <Minus className="size-4" />}
          </IconButton>

          <IconButton onClick={onClose} tone="danger" aria-label="Tutup widget" title="Tutup" className="size-7">
            <X className="size-4" />
          </IconButton>
        </div>
      </header>

      {/* Isi */}
      <div className="relative min-h-0 flex-1">{children}</div>

      {/* Pegangan ubah ukuran (desktop saja) */}
      {!locked && (
        <>
          {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((dir) => (
            <ResizeHandle
              key={dir}
              dir={dir}
              geometry={geometry}
              onGeometryChange={onGeometryChange}
              viewport={viewport}
            />
          ))}
          <div className="pointer-events-none absolute right-1 bottom-1 text-ink-300 dark:text-ink-700">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M11 5L5 11M11 9l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}
    </div>
  )
}
