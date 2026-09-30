/**
 * Potongan visual yang dipakai bersama beberapa halaman.
 */
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, MessageSquare, Play, Sparkles } from 'lucide-react'
import { Link } from '../lib/router'
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
    <header className="relative mx-auto max-w-4xl px-4 pt-28 pb-10 text-center sm:px-6 sm:pt-36 sm:pb-14">
      <nav
        aria-label="Remah roti"
        className="flex animate-fade-up items-center justify-center gap-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400"
      >
        <Link to="/" className="rounded transition hover:text-brand-600 dark:hover:text-brand-300">
          Beranda
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink-900 dark:text-white">{route.label}</span>
      </nav>

      <span
        className="mt-5 inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase dark:text-brand-200"
        style={{ animationDelay: '60ms' }}
      >
        <Icon className="size-3.5" />
        {route.label}
      </span>

      <h1
        className="mt-4 animate-fade-up text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
        style={{ animationDelay: '100ms' }}
      >
        {title}
      </h1>
      <p
        className="mx-auto mt-4 max-w-2xl animate-fade-up text-base leading-relaxed text-ink-600 sm:text-lg dark:text-ink-300"
        style={{ animationDelay: '150ms' }}
      >
        {subtitle}
      </p>
      {children && (
        <div className="mt-7 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {children}
        </div>
      )}
    </header>
  )
}

/** Navigasi halaman sebelumnya / berikutnya di kaki setiap halaman. */
export function Pager({ path }: { path: string }) {
  const { prev, next } = siblings(path)
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Halaman lain"
      className="mx-auto grid max-w-6xl gap-3 px-4 pb-16 sm:grid-cols-2 sm:px-6"
    >
      {prev ? (
        <Link
          to={prev.path}
          className="group flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/70 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300/60 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03]"
        >
          <ArrowLeft className="size-4 shrink-0 text-ink-400 transition-transform group-hover:-translate-x-1" />
          <span className="min-w-0">
            <span className="block text-[0.7rem] font-bold tracking-wide text-ink-400 uppercase">
              Sebelumnya
            </span>
            <span className="block truncate text-sm font-bold">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next && (
        <Link
          to={next.path}
          className="group flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/70 p-4 text-right backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300/60 hover:shadow-lg sm:justify-end dark:border-white/[0.08] dark:bg-white/[0.03]"
        >
          <span className="min-w-0">
            <span className="block text-[0.7rem] font-bold tracking-wide text-ink-400 uppercase">
              Selanjutnya
            </span>
            <span className="block truncate text-sm font-bold">{next.label}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </nav>
  )
}

/** Ajakan mencoba — dipakai di beberapa halaman. */
export function CtaBanner({
  onLaunch,
  active,
  title = 'Siap mencoba sekarang?',
  desc = 'Tekan tombol di bawah — bubble akan muncul di sudut layar ini juga. Tanpa API key pun bisa, pakai Mode Demo.',
}: {
  onLaunch: () => void
  active: boolean
  title?: string
  desc?: string
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-cyan-500 px-6 py-14 text-center shadow-2xl sm:px-12">
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">{desc}</p>
          <button
            type="button"
            onClick={onLaunch}
            className="group mx-auto mt-8 flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-brand-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
          >
            <Play className="size-5 fill-current" />
            {active ? 'Buka widget' : 'Jalankan CikitoAI'}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function HeroMock() {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: '260ms' }}>
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 to-cyan-400/20 blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-ink-900/70">
        {/* bar jendela */}
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.07]">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <div className="mx-auto flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-3 py-1 text-[11px] text-ink-400 dark:bg-white/[0.06]">
            websitekamu.com
          </div>
        </div>

        <div className="relative h-[19rem] p-4 sm:h-[21rem]">
          {/* konten halaman palsu */}
          <div className="space-y-2.5 opacity-60">
            <div className="h-3 w-1/3 rounded-full bg-ink-200 dark:bg-white/10" />
            <div className="h-2 w-4/5 rounded-full bg-ink-100 dark:bg-white/[0.06]" />
            <div className="h-2 w-3/5 rounded-full bg-ink-100 dark:bg-white/[0.06]" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-ink-100 dark:bg-white/[0.05]" />
              ))}
            </div>
            <div className="h-2 w-2/3 rounded-full bg-ink-100 dark:bg-white/[0.06]" />
            <div className="h-2 w-1/2 rounded-full bg-ink-100 dark:bg-white/[0.06]" />
          </div>

          {/* panel widget mini */}
          <div className="absolute right-3 bottom-3 w-[62%] max-w-[15rem] animate-float overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-2xl dark:border-white/10 dark:bg-ink-950">
            <div className="flex items-center gap-2 border-b border-black/[0.06] bg-gradient-to-r from-brand-500/10 to-cyan-500/10 px-2.5 py-2 dark:border-white/[0.07]">
              <span className="grid size-6 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 text-white">
                <Sparkles className="size-3" />
              </span>
              <span className="text-[11px] font-bold">CikitoAI</span>
              <span className="ml-auto flex gap-1">
                <span className="size-1.5 rounded-full bg-ink-300 dark:bg-white/20" />
                <span className="size-1.5 rounded-full bg-ink-300 dark:bg-white/20" />
                <span className="size-1.5 rounded-full bg-ink-300 dark:bg-white/20" />
              </span>
            </div>
            <div className="space-y-2 p-2.5">
              <div className="ml-auto w-3/4 rounded-xl rounded-tr-sm bg-gradient-to-br from-brand-600 to-indigo-600 px-2.5 py-1.5 text-[10px] text-white">
                Ringkas artikel ini dong
              </div>
              <div className="w-[88%] space-y-1 rounded-xl rounded-tl-sm border border-black/[0.06] bg-ink-50 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.06]">
                <div className="h-1.5 w-full rounded-full bg-ink-200 dark:bg-white/15" />
                <div className="h-1.5 w-5/6 rounded-full bg-ink-200 dark:bg-white/15" />
                <div className="h-1.5 w-2/3 rounded-full bg-brand-300/70 dark:bg-brand-500/50" />
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-black/[0.07] px-2 py-1.5 dark:border-white/10">
                <span className="text-[9px] text-ink-400">Tanya apa saja…</span>
                <span className="ml-auto grid size-4 place-items-center rounded-md bg-gradient-to-br from-brand-600 to-indigo-500">
                  <ArrowRight className="size-2.5 text-white" />
                </span>
              </div>
            </div>
          </div>

          {/* bubble mini */}
          <div
            className="absolute right-4 bottom-4 grid size-11 translate-x-1/3 translate-y-1/3 animate-float place-items-center rounded-full bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-[0_10px_25px_-5px_rgba(109,43,245,0.7)] ring-2 ring-white/40"
            style={{ animationDelay: '-2s' }}
          >
            <MessageSquare className="size-5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeviceMock() {
  return (
    <div className="flex items-end justify-center gap-4">
      {/* laptop */}
      <div className="hidden w-full max-w-[19rem] sm:block">
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-ink-900">
          <div className="flex gap-1 border-b border-black/[0.06] px-2 py-1.5 dark:border-white/[0.07]">
            <span className="size-1.5 rounded-full bg-ink-300 dark:bg-white/20" />
            <span className="size-1.5 rounded-full bg-ink-300 dark:bg-white/20" />
          </div>
          <div className="relative h-36 p-2">
            <div className="space-y-1.5 opacity-50">
              <div className="h-1.5 w-2/3 rounded-full bg-ink-200 dark:bg-white/10" />
              <div className="h-1.5 w-1/2 rounded-full bg-ink-200 dark:bg-white/10" />
              <div className="h-12 rounded-lg bg-ink-100 dark:bg-white/[0.05]" />
            </div>
            <div className="absolute right-2 bottom-2 h-20 w-24 rounded-lg border border-brand-400/40 bg-gradient-to-br from-brand-500/15 to-cyan-500/15 shadow-lg backdrop-blur">
              <div className="m-1.5 h-1.5 w-10 rounded-full bg-brand-400/60" />
              <div className="m-1.5 h-1 w-14 rounded-full bg-ink-200 dark:bg-white/15" />
              <div className="m-1.5 h-1 w-12 rounded-full bg-ink-200 dark:bg-white/15" />
            </div>
          </div>
        </div>
        <div className="mx-auto h-1.5 w-2/3 rounded-b-xl bg-ink-200 dark:bg-white/10" />
      </div>

      {/* ponsel */}
      <div className="w-28 shrink-0 sm:w-32">
        <div className="overflow-hidden rounded-[1.4rem] border-4 border-ink-900 bg-white shadow-xl dark:border-ink-800 dark:bg-ink-900">
          <div className="relative h-48">
            <div className="mx-auto mt-1 h-1 w-8 rounded-full bg-ink-300 dark:bg-white/20" />
            <div className="space-y-1.5 p-2 opacity-50">
              <div className="h-1.5 w-3/4 rounded-full bg-ink-200 dark:bg-white/10" />
              <div className="h-1.5 w-1/2 rounded-full bg-ink-200 dark:bg-white/10" />
            </div>
            <div className="absolute inset-x-1 bottom-1 h-28 rounded-xl border border-brand-400/40 bg-gradient-to-br from-brand-500/15 to-cyan-500/15 p-1.5 shadow-lg backdrop-blur">
              <div className="mx-auto h-0.5 w-6 rounded-full bg-ink-300 dark:bg-white/25" />
              <div className="mt-2 ml-auto h-3 w-3/4 rounded-md rounded-tr-sm bg-gradient-to-br from-brand-600 to-indigo-600" />
              <div className="mt-1 h-5 w-5/6 rounded-md rounded-tl-sm bg-ink-100 dark:bg-white/10" />
              <div className="mt-1.5 h-3 rounded-md border border-black/[0.07] dark:border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
