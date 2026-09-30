import { useRef, useState } from 'react'
import { MessageCircleMore, Move, X } from 'lucide-react'
import type { Point } from '../../types'
import { usePointerDrag } from '../../hooks/usePointerDrag'
import { cn } from '../../lib/utils'

interface Props {
  pos: Point
  size: number
  hint: boolean
  attention: boolean
  viewportWidth: number
  onMove: (pos: Point, animate?: boolean) => void
  onDragEnd: (pos: Point) => void
  onOpen: () => void
  onDismiss: () => void
}

export function Bubble({
  pos,
  size,
  hint,
  attention,
  viewportWidth,
  onMove,
  onDragEnd,
  onOpen,
  onDismiss,
}: Props) {
  const start = useRef<Point>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [animate, setAnimate] = useState(false)

  const drag = usePointerDrag({
    cursor: 'grabbing',
    onStart: () => {
      start.current = pos
      setAnimate(false)
      setDragging(true)
    },
    onMove: (dx, dy) => {
      onMove({ x: start.current.x + dx, y: start.current.y + dy })
    },
    onEnd: ({ moved, dx, dy, duration }) => {
      setDragging(false)
      if (!moved && duration < 600) {
        onOpen()
        return
      }
      setAnimate(true)
      onDragEnd({ x: start.current.x + dx, y: start.current.y + dy })
      window.setTimeout(() => setAnimate(false), 340)
    },
  })

  return (
    <div
      className={cn(
        'group fixed z-[9998] touch-none select-none',
        animate && 'transition-[left,top] duration-300 ease-out',
      )}
      style={{ left: pos.x, top: pos.y, width: size, height: size }}
    >
      {/* Cincin denyut penarik perhatian */}
      {attention && !dragging && (
        <span className="pointer-events-none absolute inset-0 animate-ring rounded-full bg-brand-500/50" />
      )}

      <button
        type="button"
        {...drag}
        onClick={(e) => e.preventDefault()}
        aria-label="Buka CikitoAI — klik untuk membuka, tahan lalu geser untuk memindahkan"
        className={cn(
          'relative flex size-full cursor-grab items-center justify-center rounded-full',
          'bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white',
          'shadow-[0_10px_30px_-6px_rgba(109,43,245,0.65)] ring-1 ring-white/25',
          'transition-transform duration-200 will-change-transform',
          dragging ? 'scale-110 cursor-grabbing shadow-2xl' : 'hover:scale-105 active:scale-95',
        )}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/15 to-white/20 opacity-70" />
        <MessageCircleMore
          className="relative size-1/2 drop-shadow-sm"
          strokeWidth={2}
          aria-hidden
        />
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full',
            'bg-white/90 text-brand-600 opacity-0 shadow transition-opacity duration-200',
            dragging && 'opacity-100',
          )}
        >
          <Move className="size-2.5" />
        </span>
      </button>

      {/* Tombol sembunyikan */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Sembunyikan widget"
        className={cn(
          'absolute -top-1 -left-1 grid size-6 place-items-center rounded-full border border-black/5',
          'bg-white text-ink-500 shadow-md transition-all duration-200 hover:scale-110 hover:text-red-500',
          'dark:border-white/10 dark:bg-ink-800 dark:text-ink-300',
          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          '[@media(hover:none)]:opacity-100',
          dragging && 'pointer-events-none opacity-0',
        )}
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>

      {/* Balon petunjuk pertama kali */}
      {hint && !dragging && (
        <div
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 animate-fade-in',
            'whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium shadow-lg',
            'bg-ink-900 text-white dark:bg-white dark:text-ink-900',
            pos.x + size / 2 > viewportWidth / 2
              ? 'right-[calc(100%+12px)]'
              : 'left-[calc(100%+12px)]',
          )}
        >
          Klik untuk buka · geser untuk pindah
        </div>
      )}
    </div>
  )
}
