/** Penggabung className ringan (pengganti clsx). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fallback di bawah */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export function maskKey(key: string): string {
  const k = key.trim()
  if (!k) return ''
  if (k.length <= 10) return `${k.slice(0, 2)}••••`
  return `${k.slice(0, 6)}••••••${k.slice(-4)}`
}

/** Dipakai saat drag/resize agar kursor konsisten & teks tidak terseleksi. */
export function setGlobalDragging(active: boolean, cursor?: string) {
  const el = document.documentElement
  el.classList.toggle('dragging', active)
  el.style.cursor = active && cursor ? cursor : ''
}

/** Ukuran font dasar widget dalam px, dibulatkan agar style inline tetap rapi. */
export function fontPx(scale: number): string {
  return `${Math.round(14 * scale * 100) / 100}px`
}

/* ------------------------------------------- pengiriman konfigurasi antar-jendela */

/** Encode objek → base64url, untuk dikirim lewat hash URL (tidak dikirim ke server). */
export function encodePayload(value: unknown): string {
  const json = JSON.stringify(value)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodePayload<T>(encoded: string): T | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(b64 + '==='.slice((b64.length + 3) % 4))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as T
  } catch {
    return null
  }
}
