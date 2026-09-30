import { Boxes, Code2, Maximize2, Minimize2, Monitor, Move, ShieldCheck, Smartphone, Zap } from 'lucide-react'
import { usePageMeta } from '../lib/router'
import { cn } from '../lib/utils'
import { CtaBanner, DeviceMock, PageHero, Pager } from '../site/parts'
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
    accent: 'from-violet-500 to-purple-600',
  },
  {
    icon: Maximize2,
    title: 'Ukuran bebas diatur',
    desc: 'Tarik 8 titik di tepi panel, pakai preset Kecil/Sedang/Besar, layar penuh, plus skala teks 80–150%.',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Minimize2,
    title: 'Buka–tutup instan',
    desc: 'Kecilkan jadi bubble, tekan Esc, atau tarik ke bawah di ponsel. Posisi & ukuran selalu diingat.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Boxes,
    title: 'Model AI apa pun',
    desc: 'OpenAI, Claude, Gemini, Groq, OpenRouter, DeepSeek, Mistral, xAI, Ollama, atau endpoint kustom.',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    icon: Zap,
    title: 'Jawaban streaming',
    desc: 'Teks mengalir kata demi kata lewat SSE, bisa dihentikan kapan saja, lengkap dengan proses berpikir.',
    accent: 'from-rose-500 to-pink-600',
  },
  {
    icon: ShieldCheck,
    title: 'Kunci tetap milikmu',
    desc: 'API key hanya tersimpan di browser dan diteruskan langsung ke penyedia — tidak pernah ditulis ke disk.',
    accent: 'from-indigo-500 to-blue-700',
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
        subtitle="Setiap detail interaksi digarap: dari fisika geser, pegangan ubah ukuran, sampai render Markdown dan streaming token."
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="group relative animate-fade-up overflow-hidden rounded-2xl border border-black/[0.07] bg-white/70 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-brand-400/30"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={cn(
                  'grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                  f.accent,
                )}
              >
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{f.desc}</p>
              <div className="pointer-events-none absolute -right-8 -bottom-8 size-24 rounded-full bg-brand-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- responsif */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-black/[0.07] bg-gradient-to-br from-brand-500/[0.09] via-transparent to-cyan-500/[0.09] p-8 sm:p-12 dark:border-white/[0.08]">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-300">
                Responsif
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Nyaman dari layar 320px sampai ultrawide
              </h2>
              <p className="mt-4 text-ink-600 dark:text-ink-300">
                Di desktop ia panel mengambang yang bisa digeser & diubah ukurannya. Di ponsel ia
                berubah jadi bottom sheet lebar penuh dengan pegangan tarik. Semua otomatis.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  {
                    icon: Monitor,
                    t: 'Desktop',
                    d: 'Panel mengambang, 8 titik resize, layar penuh, pintasan Esc.',
                  },
                  {
                    icon: Smartphone,
                    t: 'Ponsel',
                    d: 'Bottom sheet, tarik ke bawah untuk menutup, target sentuh lega.',
                  },
                  {
                    icon: Code2,
                    t: 'Konten kaya',
                    d: 'Markdown, tabel, dan blok kode dengan tombol salin.',
                  },
                ].map((r) => (
                  <li key={r.t} className="flex gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-white/10 dark:text-brand-300">
                      <r.icon className="size-4" />
                    </span>
                    <span>
                      <strong className="block text-sm font-bold">{r.t}</strong>
                      <span className="text-sm text-ink-600 dark:text-ink-400">{r.d}</span>
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
