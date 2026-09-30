/**
 * CikitoAI — bundel tempel (embed).
 *
 * Satu baris <script> menempelkan bubble mengambang ke website mana pun:
 *
 *   <script src="https://contoh.com/embed/cikito-widget.js"
 *           data-transport="auto" data-theme="auto" defer></script>
 *
 * Semua UI dirender di dalam Shadow DOM sehingga CSS situs tuan rumah dan CSS
 * widget tidak saling mengganggu. Bisa juga dikendalikan lewat JavaScript:
 *
 *   CikitoAI.init({ apiBase: 'https://contoh.com', theme: 'dark' })
 *   CikitoAI.open() / CikitoAI.close() / CikitoAI.toggle() / CikitoAI.destroy()
 */
import { createRoot, type Root } from 'react-dom/client'
import css from './embed.css?inline'
import type { AIConfig, WidgetStage } from '../types'
import { PROVIDER_MAP, defaultConfig } from '../lib/providers'
import { KEYS, loadJSON, saveJSON } from '../lib/storage'
import { setRuntime, type Transport } from '../lib/runtime'
import { EmbedApp, commandStage, getStage } from './EmbedApp'

export interface EmbedOptions {
  /** Asal backend CikitoAI. Default: asal berkas <script> ini. */
  apiBase?: string
  /** proxy | direct | auto (default) — lihat src/lib/runtime.ts. */
  transport?: Transport
  /** light | dark | auto (default: auto, mengikuti preferensi sistem). */
  theme?: 'light' | 'dark' | 'auto'
  /** Mulai dengan panel terbuka, bukan bubble. */
  open?: boolean
  /** Aktifkan pintasan Ctrl/Cmd + K (mati secara bawaan). */
  hotkey?: boolean
  /** Sisipkan font Plus Jakarta Sans ke halaman tuan rumah. */
  font?: boolean
  zIndex?: number
  storagePrefix?: string
  /** Isian awal — tetap bisa diubah pengguna lewat form. */
  provider?: string
  model?: string
  apiKey?: string
  system?: string
  /** Langsung ke layar chat bila konfigurasi awal sudah lengkap. */
  skipSetup?: boolean
  /** Setel false untuk mencegah pemasangan otomatis (pasang manual lewat init()). */
  auto?: boolean
}

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'

/* document.currentScript hanya valid saat modul dievaluasi. */
const selfScript = (document.currentScript as HTMLScriptElement | null) ?? null

/**
 * Opsi bisa juga dititipkan lewat variabel global sebelum skrip dimuat —
 * dipakai ekstensi peramban yang menyuntikkan bundel ini tanpa tag <script>.
 */
const globalOptions =
  (globalThis as unknown as { CIKITO_EMBED_OPTIONS?: EmbedOptions }).CIKITO_EMBED_OPTIONS ?? {}

/* ------------------------------------------------------------- pembacaan opsi */

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback
  return value !== 'false' && value !== '0' && value !== 'no'
}

function optionsFromScript(el: HTMLScriptElement | null): EmbedOptions {
  if (!el) return {}
  const d = el.dataset
  let apiBase = d.apiBase
  if (!apiBase && el.src) {
    try {
      const origin = new URL(el.src, location.href).origin
      if (origin !== location.origin) apiBase = origin
    } catch {
      /* abaikan src yang tidak valid */
    }
  }
  return {
    apiBase,
    transport: d.transport as Transport | undefined,
    theme: d.theme as EmbedOptions['theme'],
    open: bool(d.open, false),
    hotkey: bool(d.hotkey, false),
    font: bool(d.font, true),
    zIndex: d.zIndex ? Number(d.zIndex) : undefined,
    storagePrefix: d.storagePrefix,
    provider: d.provider,
    model: d.model,
    apiKey: d.apiKey,
    system: d.system,
    skipSetup: bool(d.skipSetup, false),
  }
}

/* ------------------------------------------------------------------ keadaan */

let host: HTMLDivElement | null = null
let root: Root | null = null
let wrapper: HTMLDivElement | null = null
let globalStyle: HTMLStyleElement | null = null
let fontLink: HTMLLinkElement | null = null
let themeQuery: MediaQueryList | null = null
let themeListener: ((e: MediaQueryListEvent) => void) | null = null

function applyTheme(mode: EmbedOptions['theme']) {
  if (!wrapper) return
  const dark = mode === 'auto' || !mode ? !!themeQuery?.matches : mode === 'dark'
  wrapper.classList.toggle('dark', dark)
  wrapper.style.colorScheme = dark ? 'dark' : 'light'
  setRuntime({ theme: dark ? 'dark' : 'light' })
}

/** Isi awal konfigurasi dari atribut, tanpa menimpa isian pengguna yang sudah ada. */
function seedConfig(o: EmbedOptions) {
  if (!o.provider && !o.model && !o.apiKey && !o.system) return
  const base = loadJSON<AIConfig>(KEYS.config, defaultConfig())
  const preset = o.provider ? PROVIDER_MAP[o.provider] : undefined
  const next: AIConfig = {
    ...base,
    ...(preset
      ? { providerId: preset.id, kind: preset.kind, baseUrl: preset.baseUrl, model: preset.models[0] }
      : {}),
    ...(o.model ? { model: o.model } : {}),
    ...(o.apiKey ? { apiKey: o.apiKey } : {}),
    ...(o.system ? { system: o.system } : {}),
  }
  saveJSON(KEYS.config, next)
  if (o.skipSetup && next.model && (next.apiKey || next.kind === 'demo')) {
    saveJSON(KEYS.seen, true)
  }
}

/* --------------------------------------------------------------------- API */

function init(userOptions: EmbedOptions = {}): void {
  if (host) {
    if (userOptions.open) commandStage('panel')
    return
  }

  const o: EmbedOptions = { ...optionsFromScript(selfScript), ...globalOptions, ...userOptions }

  setRuntime({
    apiBase: o.apiBase ?? '',
    transport: o.transport ?? 'auto',
    embedded: true,
    storagePrefix: o.storagePrefix || 'cikito.',
  })
  seedConfig(o)

  /* Font (opsional) — @font-face harus berada di dokumen, bukan di shadow root. */
  if (o.font !== false && !document.querySelector('link[data-cikito-font]')) {
    fontLink = document.createElement('link')
    fontLink.rel = 'stylesheet'
    fontLink.href = FONT_URL
    fontLink.setAttribute('data-cikito-font', '')
    document.head.appendChild(fontLink)
  }

  /* Cegah seleksi teks halaman tuan rumah saat widget digeser. */
  globalStyle = document.createElement('style')
  globalStyle.setAttribute('data-cikito', '')
  globalStyle.textContent =
    'html.dragging,html.dragging *{user-select:none !important;cursor:inherit !important}'
  document.head.appendChild(globalStyle)

  host = document.createElement('div')
  host.id = 'cikito-widget-host'
  host.setAttribute('data-cikito', '')
  host.style.cssText = `position:fixed;top:0;left:0;width:0;height:0;border:0;padding:0;margin:0;z-index:${
    o.zIndex ?? 2147483000
  }`
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = css
  shadow.appendChild(style)

  wrapper = document.createElement('div')
  wrapper.className = 'cikito-root'
  shadow.appendChild(wrapper)

  themeQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null
  applyTheme(o.theme ?? 'auto')
  if ((o.theme ?? 'auto') === 'auto' && themeQuery) {
    themeListener = () => applyTheme('auto')
    themeQuery.addEventListener('change', themeListener)
  }

  const initialStage: WidgetStage = o.open ? 'panel' : 'bubble'
  root = createRoot(wrapper)
  root.render(<EmbedApp initialStage={initialStage} hotkey={!!o.hotkey} />)
}

function destroy(): void {
  root?.unmount()
  root = null
  host?.remove()
  host = null
  wrapper = null
  globalStyle?.remove()
  globalStyle = null
  fontLink?.remove()
  fontLink = null
  if (themeQuery && themeListener) themeQuery.removeEventListener('change', themeListener)
  themeQuery = null
  themeListener = null
}

const api = {
  init,
  destroy,
  open: () => commandStage('panel'),
  close: () => commandStage('bubble'),
  hide: () => commandStage('hidden'),
  show: () => commandStage('bubble'),
  toggle: () => commandStage(getStage() === 'panel' ? 'bubble' : 'panel'),
  get stage() {
    return getStage()
  },
  get mounted() {
    return !!host
  },
  version: '1.0.0',
}

declare global {
  interface Window {
    CikitoAI: typeof api
  }
}

window.CikitoAI = api

/* Pasang otomatis, kecuali diminta manual lewat data-auto="false". */
if (globalOptions.auto !== false && bool(selfScript?.dataset.auto, true)) {
  if (document.body) init()
  else document.addEventListener('DOMContentLoaded', () => init(), { once: true })
}

export default api
