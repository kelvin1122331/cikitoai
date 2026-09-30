import { useCallback, useEffect, useRef } from 'react'
import { setGlobalDragging } from '../lib/utils'

export interface DragEndInfo {
  dx: number
  dy: number
  moved: boolean
  duration: number
}

interface Options {
  onStart?: (e: React.PointerEvent) => void
  onMove: (dx: number, dy: number, ev: PointerEvent) => void
  onEnd?: (info: DragEndInfo) => void
  /** Jarak (px) sebelum gerakan dianggap "drag" dan bukan "klik". */
  threshold?: number
  cursor?: string
  disabled?: boolean
}

/**
 * Drag universal berbasis Pointer Events — jalan untuk mouse, sentuhan, dan pena.
 * Mengembalikan handler yang tinggal di-spread ke elemen pemicu.
 */
export function usePointerDrag({ onStart, onMove, onEnd, threshold = 4, cursor, disabled }: Options) {
  const state = useRef<{
    active: boolean
    startX: number
    startY: number
    startedAt: number
    moved: boolean
    dx: number
    dy: number
  }>({ active: false, startX: 0, startY: 0, startedAt: 0, moved: false, dx: 0, dy: 0 })

  const cb = useRef({ onStart, onMove, onEnd, threshold, cursor })
  cb.current = { onStart, onMove, onEnd, threshold, cursor }

  useEffect(() => {
    const handleMove = (ev: PointerEvent) => {
      const s = state.current
      if (!s.active) return
      s.dx = ev.clientX - s.startX
      s.dy = ev.clientY - s.startY
      if (!s.moved && Math.hypot(s.dx, s.dy) > cb.current.threshold!) {
        s.moved = true
        setGlobalDragging(true, cb.current.cursor)
      }
      if (s.moved) {
        ev.preventDefault()
        cb.current.onMove(s.dx, s.dy, ev)
      }
    }

    const finish = () => {
      const s = state.current
      if (!s.active) return
      s.active = false
      setGlobalDragging(false)
      cb.current.onEnd?.({
        dx: s.dx,
        dy: s.dy,
        moved: s.moved,
        duration: Date.now() - s.startedAt,
      })
    }

    window.addEventListener('pointermove', handleMove, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      setGlobalDragging(false)
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button === 2) return
      state.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startedAt: Date.now(),
        moved: false,
        dx: 0,
        dy: 0,
      }
      onStart?.(e)
    },
    [disabled, onStart],
  )

  return { onPointerDown }
}
