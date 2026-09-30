import {
  Boxes,
  Code2,
  Maximize2,
  Minimize2,
  Monitor,
  Move,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react'
import { usePageMeta } from '../lib/router'
import { CtaBanner, DeviceMock, PageHero, Pager, SectionTitle } from '../site/parts'
import { ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

const FEATURES = [
  {
    icon: Move,
    title: 'Geser ke mana saja',
    desc: 'Tarik bubble dengan mouse atau jari. Lepas, dan ia menempel rapi ke tepi layar terdekat.',
  },
  {
    icon: Maximize2,
    title: 'Ukuran bebas diatur',
    desc: 'Tarik 8 titik di tepi panel, pakai preset Kecil/Sedang/Besar, layar penuh, plus skala teks 80–150%.',
  },
  {
    icon: Minimize2,
    title: 'Buka–tutup instan',
    desc: 'Kecilkan jadi bubble, tekan Esc, atau tarik ke bawah di ponsel. Posisi dan ukuran selalu diingat.',
  },
  {
    icon: Boxes,
    title: 'Model AI apa pun',
    desc: 'OpenAI, Claude, Gemini, Groq, OpenRouter, DeepSeek, Mistral, xAI, Ollama, atau endpoint kustom.',
  },
  {
    icon: Zap,
    title: 'Jawaban streaming',
    desc: 'Teks mengalir kata demi kata lewat SSE, bisa dihentikan kapan saja, lengkap dengan proses berpikir.',
  },
  {
    icon: ShieldCheck,
    title: 'Kunci tetap milikmu',
    desc: 'API key hanya tersimpan di peramban dan diteruskan langsung ke penyedia — tidak pernah ditulis ke disk.',
  },
]

const SURFACES = [
  {
    icon: Monitor,
    t: 'Desktop',
    d: 'Panel mengambang, 8 titik ubah ukuran, layar penuh, pintasan Esc dan Ctrl + K.',
  },
  {
    icon: Smartphone,
    t: 'Ponsel',
    d: 'Berubah jadi bottom sheet lebar penuh dengan pegangan tarik dan target sentuh lega.',
  },
  {
    icon: Code2,
    t: 'Konten kaya',
    d: 'Markdown, tabel, dan blok kode dengan penyorotan serta tombol salin satu klik.',
  },
]

export function Fitur({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/fitur']
  usePageMeta(route.title, route.description)

  return (
    <>
      <PageHero
        route={route}
        title="Dibuat semaksimal mungkin"
        subtitle="Setiap detail interaksi digarap: dari fisika geser dan pegangan ubah ukuran, sampai render Markdown dan streaming token."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="card grid gap-px overflow-hidden bg-ink-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-ink-800">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="group animate-fade-up bg-white p-7 transition-colors duration-200 hover:bg-ink-50/70 dark:bg-ink-950 dark:hover:bg-ink-900/40"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-ink-50 text-ink-700 transition-colors duration-200 group-hover:border-brand-500/30 group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300 dark:group-hover:text-brand-400">
                <f.icon className="size-4" />
              </span>
              <h3 className="mt-5 text-base font-medium text-ink-950 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- responsif */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="card overflow-hidden p-8 sm:p-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionTitle
                eyebrow="Responsif"
                title="Nyaman dari layar 320px sampai ultrawide"
                desc="Di desktop ia panel mengambang yang bisa digeser dan diubah ukurannya. Di ponsel ia berubah jadi bottom sheet lebar penuh. Semuanya otomatis."
              />
              <ul className="mt-8 space-y-5">
                {SURFACES.map((r) => (
                  <li key={r.t} className="flex gap-4">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
                      <r.icon className="size-4" />
                    </span>
                    <span>
                      <strong className="block text-sm font-medium text-ink-950 dark:text-white">
                        {r.t}
                      </strong>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                        {r.d}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <DeviceMock />
          </div>
        </div>
      </section>

      <CtaBanner onLaunch={onLaunch} active={active} />
      <Pager path={route.path} />
    </>
  )
}
