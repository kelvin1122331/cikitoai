import type { LucideIcon } from 'lucide-react'
import { Blocks, HelpCircle, Home, Route as RouteIcon, Send, Sparkles } from 'lucide-react'

export interface RouteDef {
  path: string
  label: string
  /** Judul tab peramban. */
  title: string
  description: string
  icon: LucideIcon
  /** Tampil di menu navigasi utama. */
  nav: boolean
}

export const ROUTES: RouteDef[] = [
  {
    path: '/',
    label: 'Beranda',
    title: 'CikitoAI — Widget AI Mengambang untuk Website Apa Pun',
    description:
      'Satu tombol Jalankan, lalu bubble AI mengambang yang bisa digeser, diubah ukurannya, dan disambungkan ke model AI apa pun.',
    icon: Home,
    nav: false,
  },
  {
    path: '/fitur',
    label: 'Fitur',
    title: 'Fitur — CikitoAI',
    description:
      'Bubble yang bisa digeser, panel yang bisa diubah ukurannya, streaming jawaban, Markdown, dan dukungan model AI apa pun.',
    icon: Sparkles,
    nav: true,
  },
  {
    path: '/cara-kerja',
    label: 'Cara kerja',
    title: 'Cara kerja — CikitoAI',
    description: 'Tiga langkah, tiga puluh detik: tekan Jalankan, masukkan API AI, lalu ngobrol.',
    icon: RouteIcon,
    nav: true,
  },
  {
    path: '/penyedia',
    label: 'Penyedia',
    title: 'Penyedia AI — CikitoAI',
    description:
      'OpenAI, Claude, Gemini, Groq, OpenRouter, DeepSeek, Mistral, xAI, Together, Ollama, LM Studio, atau endpoint kustom.',
    icon: Blocks,
    nav: true,
  },
  {
    path: '/bawa-ke-mana-saja',
    label: 'Bawa ke mana saja',
    title: 'Bawa ke mana saja — CikitoAI',
    description:
      'Tempel di website lain, bookmarklet, jendela mengambang, ekstensi peramban, atau pasang sebagai aplikasi.',
    icon: Send,
    nav: true,
  },
  {
    path: '/faq',
    label: 'FAQ',
    title: 'FAQ — CikitoAI',
    description: 'Pertanyaan yang sering muncul seputar model, API key, privasi, dan penggunaan.',
    icon: HelpCircle,
    nav: true,
  },
]

export const NAV_ROUTES = ROUTES.filter((r) => r.nav)
export const ROUTE_MAP: Record<string, RouteDef> = Object.fromEntries(
  ROUTES.map((r) => [r.path, r]),
)

/** Halaman sebelum & sesudah, untuk navigasi "lanjut ke" di bawah tiap halaman. */
export function siblings(path: string): { prev?: RouteDef; next?: RouteDef } {
  const i = ROUTES.findIndex((r) => r.path === path)
  if (i < 0) return {}
  return { prev: ROUTES[i - 1], next: ROUTES[i + 1] }
}
