import { ArrowRight, Check, Play } from 'lucide-react'
import { Link, usePageMeta } from '../lib/router'
import { PROVIDERS } from '../lib/providers'
import { cn } from '../lib/utils'
import { CtaBanner, HeroMock } from '../site/parts'
import { NAV_ROUTES, ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

const TEASER: Record<string, string> = {
  '/fitur': 'Geser, ubah ukuran, buka–tutup, streaming, Markdown, dan model AI apa pun.',
  '/cara-kerja': 'Tiga langkah, tiga puluh detik: Jalankan → isi API → ngobrol.',
  '/penyedia': '13 preset penyedia plus endpoint kustom — kolom model bebas diisi.',
  '/bawa-ke-mana-saja': 'Tempel di situs lain, bookmarklet, jendela mengambang, ekstensi, PWA.',
  '/faq': 'Soal model, keamanan API key, mode demo, dan penggunaan di ponsel.',
}

export function Beranda({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/']
  usePageMeta(route.title, route.description)

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-36 lg:pt-40 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="text-center lg:text-left">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-200">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
              </span>
              Widget AI mengambang · siap tempel di website apa pun
            </span>

            <h1
              className="mt-5 animate-fade-up text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem]"
              style={{ animationDelay: '60ms' }}
            >
              Satu tombol <span className="text-gradient">Jalankan</span>,
              <br className="hidden sm:block" /> asisten AI langsung mengambang.
            </h1>

            <p
              className="mx-auto mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-ink-600 sm:text-lg lg:mx-0 dark:text-ink-300"
              style={{ animationDelay: '120ms' }}
            >
              Bubble bulat yang bisa <strong className="text-ink-900 dark:text-white">digeser</strong>
              , panel yang bisa{' '}
              <strong className="text-ink-900 dark:text-white">diubah ukurannya</strong>,{' '}
              <strong className="text-ink-900 dark:text-white">dibuka–tutup</strong>, dan terhubung
              ke <strong className="text-ink-900 dark:text-white">model AI apa pun</strong> lewat API
              key milikmu.
            </p>

            <div
              className="mt-8 flex animate-fade-up flex-col items-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: '180ms' }}
            >
              <button
                type="button"
                onClick={onLaunch}
                className={cn(
                  'group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-7 py-4 sm:w-auto',
                  'bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500 text-base font-bold text-white',
                  'shadow-[0_18px_40px_-12px_rgba(109,43,245,0.85)] transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-12px_rgba(109,43,245,0.95)] active:translate-y-0 active:scale-[0.99]',
                )}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Play className="size-5 fill-current" />
                {active ? 'Buka widget sekarang' : 'Jalankan sekarang'}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                to="/cara-kerja"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-6 py-4 text-base font-semibold text-ink-700 backdrop-blur transition hover:border-brand-300 hover:text-brand-700 sm:w-auto dark:border-white/12 dark:bg-white/5 dark:text-ink-200 dark:hover:text-white"
              >
                Lihat cara kerjanya
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <ul
              className="mt-7 flex animate-fade-up flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500 lg:justify-start dark:text-ink-400"
              style={{ animationDelay: '240ms' }}
            >
              {['Tanpa registrasi', 'Ada Mode Demo', 'Gratis & open source'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroMock />
        </div>
      </section>

      {/* -------------------------------------------------------- penyedia */}
      <section className="relative py-8 sm:py-10">
        <p className="mb-5 text-center text-xs font-bold tracking-[0.18em] text-ink-400 uppercase">
          Terhubung ke penyedia mana pun
        </p>
        <div className="mask-fade-x relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
            {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-black/[0.07] bg-white/70 px-4 py-2.5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white',
                    p.accent,
                  )}
                >
                  {p.short}
                </span>
                <span className="text-sm font-semibold whitespace-nowrap text-ink-700 dark:text-ink-200">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/penyedia"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition hover:gap-2.5 dark:text-brand-300"
          >
            Lihat semua penyedia
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------ menu utama */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-300">
            Jelajahi
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Setiap topik punya halamannya sendiri
          </h2>
          <p className="mt-4 text-ink-600 dark:text-ink-300">
            Tidak ada halaman panjang yang harus digulir terus. Pilih yang kamu butuhkan — masing
            masing terbuka sebagai halaman terpisah.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_ROUTES.map((r, i) => {
            const Icon = r.icon
            return (
              <Link
                key={r.path}
                to={r.path}
                className="group relative animate-fade-up overflow-hidden rounded-2xl border border-black/[0.07] bg-white/70 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-brand-400/30"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 flex items-center gap-1.5 text-lg font-bold tracking-tight">
                  {r.label}
                  <ArrowRight className="size-4 text-brand-500 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                  {TEASER[r.path]}
                </p>
                <span className="mt-3 block font-mono text-[0.7rem] text-ink-400">{r.path}</span>
                <div className="pointer-events-none absolute -right-8 -bottom-8 size-24 rounded-full bg-brand-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            )
          })}
        </div>
      </section>

      <CtaBanner onLaunch={onLaunch} active={active} />
    </>
  )
}
