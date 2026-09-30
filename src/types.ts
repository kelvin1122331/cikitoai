export type ProviderKind = 'openai' | 'anthropic' | 'gemini' | 'demo'

export interface ProviderPreset {
  id: string
  name: string
  /** Bentuk API yang dipakai penyedia ini. */
  kind: ProviderKind
  baseUrl: string
  /** Contoh format API key, ditampilkan sebagai placeholder. */
  keyPlaceholder: string
  /** Di mana pengguna bisa mengambil API key-nya. */
  keyUrl?: string
  /** Saran model — kolom model tetap bebas diisi apa pun. */
  models: string[]
  /** Inisial pada lencana penyedia. */
  short: string
  /** Kelas gradien untuk lencana. */
  accent: string
  /** Penyedia lokal / tidak butuh API key. */
  noKey?: boolean
  /** Base URL bisa diubah pengguna (mis. penyedia kustom / lokal). */
  editableBase?: boolean
  note?: string
}

export interface AIConfig {
  providerId: string
  kind: ProviderKind
  baseUrl: string
  apiKey: string
  model: string
  system: string
  temperature: number
  maxTokens: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  createdAt: number
  error?: boolean
  streaming?: boolean
  stopped?: boolean
  usage?: { in: number | null; out: number | null }
}

export type WidgetStage = 'hidden' | 'bubble' | 'panel'
export type PanelView = 'setup' | 'chat'
export type Point = { x: number; y: number }
export type Size = { w: number; h: number }

export interface StreamEvent {
  type: 'delta' | 'reasoning' | 'usage' | 'error' | 'notice' | 'done'
  text?: string
  message?: string
  usage?: { in: number | null; out: number | null }
}
