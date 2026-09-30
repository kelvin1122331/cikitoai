/**
 * Router mungil berbasis History API — tanpa dependensi.
 *
 * Cukup untuk situs multi-halaman seperti CikitoAI: setiap menu punya URL
 * sendiri (`/fitur`, `/cara-kerja`, …), bisa di-bookmark, bisa dibuka di tab
 * baru dengan Ctrl/⌘ + klik, dan tombol Back/Forward peramban tetap berfungsi.
 */
import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react'

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('popstate', onChange)
  }
}

const getSnapshot = () => window.location.pathname
const getServerSnapshot = () => '/'

/** Path aktif, mis. "/fitur". Selalu tanpa query & hash. */
export function usePathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  const current = window.location.pathname + window.location.search + window.location.hash
  if (to === current) return
  if (options.replace) window.history.replaceState(null, '', to)
  else window.history.pushState(null, '', to)
  emit()
}

interface LinkProps {
  to: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  onNavigate?: () => void
  'aria-label'?: string
  title?: string
}

/**
 * Tautan internal. Tetap sebuah <a href> sungguhan, jadi:
 * klik tengah / Ctrl / ⌘ + klik tetap membuka tab baru seperti yang diharapkan.
 */
export function Link({ to, children, className, style, onNavigate, ...rest }: LinkProps) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      e.preventDefault()
      onNavigate?.()
      navigate(to)
    },
    [to, onNavigate],
  )

  return (
    <a href={to} onClick={onClick} className={className} style={style} {...rest}>
      {children}
    </a>
  )
}

/** Gulir ke atas setiap kali pindah halaman (kecuali navigasi Back/Forward). */
export function useScrollReset(pathname: string) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
}

/** Judul tab & deskripsi halaman, supaya tiap rute terasa sebagai halaman utuh. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (!description) return
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.appendChild(tag)
    }
    tag.content = description
  }, [title, description])
}
