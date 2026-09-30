/**
 * Konfigurasi runtime — menentukan "di mana" widget sedang berjalan dan
 * lewat jalur mana permintaan AI dikirim.
 *
 *  proxy     → lewat backend CikitoAI (/api/chat). Paling kompatibel.
 *  direct    → browser memanggil penyedia AI langsung (tanpa backend sama sekali).
 *  auto      → coba proxy; kalau backend tidak terjangkau, pindah ke direct.
 *  extension → lewat service worker ekstensi peramban (bebas CORS).
 */
export type Transport = 'proxy' | 'direct' | 'auto' | 'extension'

export interface RuntimeConfig {
  /** Asal backend CikitoAI, mis. "https://cikito.example.com". Kosong = origin sendiri. */
  apiBase: string
  transport: Transport
  /** true bila widget ditempel di website orang lain lewat <script>. */
  embedded: boolean
  /** true bila sedang berjalan di jendela mengambang / popout. */
  popout: boolean
  /** Awalan kunci localStorage, supaya beberapa instance tidak saling bentrok. */
  storagePrefix: string
  /** Tema yang sedang aktif — diwariskan ke jendela popout. */
  theme: 'light' | 'dark'
}

let runtime: RuntimeConfig = {
  apiBase: '',
  transport: 'proxy',
  embedded: false,
  popout: false,
  storagePrefix: 'cikito.',
  theme: 'dark',
}

export function getRuntime(): RuntimeConfig {
  return runtime
}

export function setRuntime(patch: Partial<RuntimeConfig>): RuntimeConfig {
  runtime = { ...runtime, ...patch }
  return runtime
}

/** URL endpoint backend, menghormati apiBase saat widget ditempel di origin lain. */
export function apiUrl(path: string): string {
  const base = runtime.apiBase.replace(/\/+$/, '')
  return base ? base + path : path
}

/** URL halaman popout (jendela mengambang). */
export function popoutUrl(): string {
  const base = runtime.apiBase.replace(/\/+$/, '')
  const origin = base || (typeof location !== 'undefined' ? location.origin : '')
  return `${origin}/?cikito=popout`
}
