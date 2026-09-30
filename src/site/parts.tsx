/**
 * Potongan visual yang dipakai bersama beberapa halaman.
 * Semua memakai kelas sistem (.card, .btn, .eyebrow) dari index.css.
 */
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from 'lucide-react'
import { Link } from '../lib/router'
import { cn } from '../lib/utils'
import { siblings, type RouteDef } from './routes'

export function PageHero({
  route,
  title,
  subtitle,
  children,
}: {
  route: RouteDef
  title: string
  subtitle: string
  children?: ReactNode
}) {
  const Icon = route.icon
  return (
    <header className="relative mx-auto max-w-6xl px-4 pt-28 pb-12 sm:px-6 sm:pt-36 sm:pb-16 lg:px-8">
      <div className="max-w-3xl">
        <nav
          aria-label="Remah roti"
          className="flex animate-fade-up items-center gap-2 text-xs text-ink-500 dark:text-ink-400"
        >
          <Link
            to="/"
            className="transition-colors hover:text-ink-950 dark:hover:text-white"
          >
            Beranda
          </Link>
          <span aria-hidden className="text-ink-300 dark:text-ink-700">
            /
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-950 dark:text-white">
            <Icon className="size-3.5 text-brand-600 dark:text-brand-400" />
            {route.label}
          </span>
        </nav>

        <h1
          className="mt-6 animate-fade-up text-[2.1rem] leading-[1.1] font-semibold tracking-tight text-ink-950 sm:text-5xl dark:text-white"
          style={{ animationDelay: '60ms' }}
        >
          {title}
        </h1>
        <p
          className="mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-ink-600 sm:text-lg dark:text-ink-400"
          style={{ animationDelay: '110ms' }}
        >
          {subtitle}
        </p>
        {children && (
          <div className="mt-8 animate-fade-up" style={{ animationDelay: '160ms' }}>
            {children}
          </div>
        )}
      </div>
    </header>
  )
}

/** Judul bagian di dalam halaman. */
export function SectionTitle({
  eyebrow,
  title,
  desc,
  className,
}: {
  eyebrow?: string
  title: string
  desc?: string
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl dark:text-white">
        {title}
      </h2>
      {desc && <p className="mt-3 text-ink-600 dark:text-ink-400">{desc}</p>}
    </div>
  )
}

/** Navigasi halaman sebelumnya / berikutnya di kaki setiap halaman. */
export function Pager({ path }: { path: string }) {
  const { prev, next } = siblings(path)
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Halaman lain"
      className="mx-auto grid max-w-6xl gap-3 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:px-8"
    >
      {prev ? (
        <Link to={prev.path} className="card card-hover group flex items-center gap-3 p-4">
          <ArrowLeft className="size-4 shrink-0 text-ink-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="min-w-0">
            <span className="block text-xs text-ink-500 dark:text-ink-400">Sebelumnya</span>
            <span className="block truncate text-sm font-medium text-ink-950 dark:text-white">
              {prev.label}
            </span>
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next && (
        <Link
          to={next.path}
          className="card card-hover group flex items-center gap-3 p-4 text-right sm:justify-end"
        >
          <span className="min-w-0">
            <span className="block text-xs text-ink-500 dark:text-ink-400">Selanjutnya</span>
            <span className="block truncate text-sm font-medium text-ink-950 dark:text-white">
              {next.label}
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-ink-400 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </nav>
  )
}

/** Ajakan mencoba — panel bergaris, bukan spanduk gradien. */
export function CtaBanner({
  onLaunch,
  active,
  title = 'Siap mencoba sekarang?',
  desc = 'Tekan tombol di bawah — bubble muncul di sudut layar ini juga. Tanpa API key pun bisa, pakai Mode Demo.',
}: {
  onLaunch: () => void
  active: boolean
  title?: string
  desc?: string
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="card relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="grid-pattern pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,black,transparent)]"
        />
        <div className="relative">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-600 sm:text-base dark:text-ink-400">
            {desc}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onLaunch}
              className="btn btn-primary btn-lg w-full sm:w-auto"
            >
              <Play className="size-4 fill-current" />
              {active ? 'Buka widget' : 'Jalankan CikitoAI'}
            </button>
            <Link
              to="/cara-kerja"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
            >
              Lihat cara kerja
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ mockup */

export function HeroMock() {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: '220ms' }}>
      <div className="card overflow-hidden shadow-lift">
        {/* bar jendela */}
        <div className="flex items-center gap-1.5 border-b border-ink-200 px-4 py-3 dark:border-ink-800">
          <span className="size-2.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          <span className="size-2.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          <span className="size-2.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          <div className="mx-auto rounded-md border border-ink-200 px-3 py-1 font-mono text-[10px] text-ink-400 dark:border-ink-800 dark:text-ink-500">
            websitekamu.com
          </div>
        </div>

        <div className="relative h-[19rem] bg-ink-50/60 p-5 sm:h-[21rem] dark:bg-ink-950/60">
          {/* konten halaman palsu */}
          <div className="space-y-3">
            <div className="h-2.5 w-1/3 rounded-full bg-ink-200 dark:bg-ink-800" />
            <div className="h-2 w-4/5 rounded-full bg-ink-200/70 dark:bg-ink-800/70" />
            <div className="h-2 w-3/5 rounded-full bg-ink-200/70 dark:bg-ink-800/70" />
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg border border-ink-200/80 bg-white dark:border-ink-800/80 dark:bg-ink-900/40"
                />
              ))}
            </div>
            <div className="h-2 w-2/3 rounded-full bg-ink-200/70 dark:bg-ink-800/70" />
            <div className="h-2 w-1/2 rounded-full bg-ink-200/70 dark:bg-ink-800/70" />
          </div>

          {/* panel widget mini */}
          <div className="absolute right-4 bottom-4 w-[64%] max-w-[15.5rem] animate-float overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-950">
            <div className="flex items-center gap-2 border-b border-ink-200 px-2.5 py-2 dark:border-ink-800">
              <span className="grid size-5 place-items-center rounded-[7px] bg-ink-950 dark:bg-white">
                <span className="size-1.5 rounded-full bg-brand-400 dark:bg-brand-500" />
              </span>
              <span className="text-[11px] font-semibold text-ink-950 dark:text-white">
                CikitoAI
              </span>
              <span className="ml-auto flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-brand-500" />
                <span className="font-mono text-[9px] text-ink-400">siap</span>
              </span>
            </div>
            <div className="space-y-2 p-2.5">
              <div className="ml-auto w-3/4 rounded-lg rounded-tr-sm bg-ink-950 px-2.5 py-1.5 text-[10px] leading-snug text-white dark:bg-white dark:text-ink-950">
                Ringkas artikel ini dong
              </div>
              <div className="w-[88%] space-y-1.5 rounded-lg rounded-tl-sm border border-ink-200 bg-ink-50 px-2.5 py-2 dark:border-ink-800 dark:bg-ink-900/60">
                <div className="h-1.5 w-full rounded-full bg-ink-200 dark:bg-ink-700" />
                <div className="h-1.5 w-5/6 rounded-full bg-ink-200 dark:bg-ink-700" />
                <div className="h-1.5 w-2/3 rounded-full bg-brand-400/70 dark:bg-brand-500/60" />
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2 py-1.5 dark:border-ink-800">
                <span className="text-[9px] text-ink-400">Tanya apa saja…</span>
                <span className="ml-auto grid size-4 place-items-center rounded bg-ink-950 dark:bg-white">
                  <ArrowRight className="size-2.5 text-white dark:text-ink-950" />
                </span>
              </div>
            </div>
          </div>

          {/* bubble mini */}
          <div
            className="absolute right-5 bottom-5 grid size-11 translate-x-1/3 translate-y-1/3 animate-float place-items-center rounded-full bg-ink-950 shadow-glow ring-1 ring-white/10 dark:bg-white"
            style={{ animationDelay: '-2.5s' }}
          >
            <span className="size-3 rounded-full bg-brand-400 dark:bg-brand-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeviceMock() {
  return (
    <div className="flex items-end justify-center gap-5">
      {/* laptop */}
      <div className="hidden w-full max-w-[19rem] sm:block">
        <div className="card overflow-hidden">
          <div className="flex gap-1 border-b border-ink-200 px-2.5 py-2 dark:border-ink-800">
            <span className="size-1.5 rounded-full bg-ink-200 dark:bg-ink-800" />
            <span className="size-1.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          </div>
          <div className="relative h-36 bg-ink-50/60 p-3 dark:bg-ink-950/60">
            <div className="space-y-2">
              <div className="h-1.5 w-2/3 rounded-full bg-ink-200 dark:bg-ink-800" />
              <div className="h-1.5 w-1/2 rounded-full bg-ink-200 dark:bg-ink-800" />
              <div className="h-12 rounded-lg border border-ink-200/80 bg-white dark:border-ink-800/80 dark:bg-ink-900/40" />
            </div>
            <div className="absolute right-2.5 bottom-2.5 h-20 w-24 rounded-lg border border-ink-200 bg-white p-1.5 shadow-soft dark:border-ink-700 dark:bg-ink-900">
              <div className="h-1.5 w-10 rounded-full bg-brand-400/80" />
              <div className="mt-1.5 h-1 w-14 rounded-full bg-ink-200 dark:bg-ink-700" />
              <div className="mt-1 h-1 w-12 rounded-full bg-ink-200 dark:bg-ink-700" />
              <div className="mt-2 h-4 rounded border border-ink-200 dark:border-ink-700" />
            </div>
          </div>
        </div>
        <div className="mx-auto h-1.5 w-2/3 rounded-b-xl bg-ink-200 dark:bg-ink-800" />
      </div>

      {/* ponsel */}
      <div className="w-28 shrink-0 sm:w-32">
        <div className="overflow-hidden rounded-[1.5rem] border-[5px] border-ink-950 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-950">
          <div className="relative h-48 bg-ink-50/60 dark:bg-ink-950">
            <div className="mx-auto mt-1.5 h-1 w-8 rounded-full bg-ink-200 dark:bg-ink-800" />
            <div className="space-y-1.5 p-2.5">
              <div className="h-1.5 w-3/4 rounded-full bg-ink-200 dark:bg-ink-800" />
              <div className="h-1.5 w-1/2 rounded-full bg-ink-200 dark:bg-ink-800" />
            </div>
            <div className="absolute inset-x-1.5 bottom-1.5 h-28 rounded-xl border border-ink-200 bg-white p-2 shadow-soft dark:border-ink-700 dark:bg-ink-900">
              <div className="mx-auto h-0.5 w-6 rounded-full bg-ink-300 dark:bg-ink-600" />
              <div className="mt-2.5 ml-auto h-3 w-3/4 rounded-md rounded-tr-sm bg-ink-950 dark:bg-white" />
              <div className="mt-1.5 h-5 w-5/6 rounded-md rounded-tl-sm bg-ink-100 dark:bg-ink-800" />
              <div className="mt-2 h-3 rounded-md border border-ink-200 dark:border-ink-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
