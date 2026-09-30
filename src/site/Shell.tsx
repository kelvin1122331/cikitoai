import { useEffect, useState, type ReactNode } from 'react'
import { CodeXml, Menu, Moon, Play, Sparkles, Sun, X } from 'lucide-react'
import { Link, usePathname } from '../lib/router'
import { cn } from '../lib/utils'
import { NAV_ROUTES } from './routes'

interface Props {
  onLaunch: () => void
  active: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  children: ReactNode
}

/**
 * Kerangka situs: latar, bilah navigasi, dan kaki halaman.
 * Setiap menu di sini membuka **halaman tersendiri**, bukan sekadar menggulir.
 */
export function Shell({ onLaunch, active, theme, onToggleTheme, children }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Menu seluler selalu tertutup setelah pindah halaman. */
  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ---------------------------------------------------------- latar */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white dark:bg-ink-950" />
        <div className="grid-pattern absolute inset-0 opacity-60 mask-fade-b" />
        <div className="absolute -top-40 -left-32 size-[34rem] animate-aurora rounded-full bg-brand-500/25 blur-[120px] dark:bg-brand-600/25" />
        <div
          className="absolute -top-20 right-0 size-[30rem] animate-aurora rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-500/15"
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="absolute top-[45%] left-1/3 size-[28rem] animate-aurora rounded-full bg-fuchsia-400/15 blur-[130px] dark:bg-fuchsia-600/15"
          style={{ animationDelay: '-11s' }}
        />
      </div>

      {/* --------------------------------------------------------- navbar */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'py-2' : 'py-3 sm:py-4',
        )}
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-5">
          <nav
            aria-label="Navigasi utama"
            className={cn(
              'flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-300 sm:px-4',
              scrolled
                ? 'glass shadow-lg shadow-black/[0.04]'
                : 'border border-transparent bg-transparent',
            )}
          >
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="CikitoAI, beranda">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-md">
                <Sparkles className="size-[18px]" />
              </span>
              <span className="text-base font-extrabold tracking-tight">
                Cikito<span className="text-gradient">AI</span>
              </span>
            </Link>

            <div className="mx-auto hidden items-center gap-1 md:flex">
              {NAV_ROUTES.map((r) => {
                const current = pathname === r.path
                return (
                  <Link
                    key={r.path}
                    to={r.path}
                    aria-label={`${r.label} — buka halaman`}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                      current
                        ? 'bg-brand-500/12 font-bold text-brand-700 dark:bg-brand-400/15 dark:text-brand-200'
                        : 'text-ink-600 hover:bg-black/[0.05] hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white',
                    )}
                  >
                    {r.label}
                  </Link>
                )
              })}
            </div>

            <div className="ml-auto flex items-center gap-1.5 md:ml-0">
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Ganti tema terang / gelap"
                className="grid size-9 place-items-center rounded-xl text-ink-500 transition hover:bg-black/[0.05] hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              </button>

              <button
                type="button"
                onClick={onLaunch}
                className={cn(
                  'group hidden items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white sm:flex',
                  'bg-gradient-to-r from-brand-600 to-indigo-500 shadow-[0_8px_20px_-8px_rgba(109,43,245,0.8)]',
                  'transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-8px_rgba(109,43,245,0.9)] active:translate-y-0',
                )}
              >
                <Play className="size-3.5 fill-current" />
                {active ? 'Buka widget' : 'Jalankan'}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Buka menu"
                aria-expanded={menuOpen}
                className="grid size-9 place-items-center rounded-xl text-ink-600 transition hover:bg-black/[0.05] md:hidden dark:text-ink-300 dark:hover:bg-white/10"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>

          {menuOpen && (
            <div className="glass mt-2 animate-fade-in space-y-1 rounded-2xl p-2 shadow-xl md:hidden">
              {NAV_ROUTES.map((r) => {
                const Icon = r.icon
                const current = pathname === r.path
                return (
                  <Link
                    key={r.path}
                    to={r.path}
                    onNavigate={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      current
                        ? 'bg-brand-500/12 font-bold text-brand-700 dark:bg-brand-400/15 dark:text-brand-200'
                        : 'text-ink-700 hover:bg-black/[0.05] dark:text-ink-200 dark:hover:bg-white/10',
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-70" />
                    {r.label}
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onLaunch()
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 px-4 py-2.5 text-sm font-bold text-white"
              >
                <Play className="size-4 fill-current" /> {active ? 'Buka widget' : 'Jalankan'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>

      {/* --------------------------------------------------------- footer */}
      <footer className="border-t border-black/[0.07] py-10 dark:border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 text-white">
                <Sparkles className="size-4" />
              </span>
              <span className="text-sm font-extrabold">
                Cikito<span className="text-gradient">AI</span>
              </span>
            </Link>

            <nav aria-label="Navigasi kaki halaman" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {NAV_ROUTES.map((r) => (
                <Link
                  key={r.path}
                  to={r.path}
                  className="text-xs font-semibold text-ink-500 transition hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
                >
                  {r.label}
                </Link>
              ))}
            </nav>

            <a
              href="https://github.com/kelvin1122331/cikitoai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
            >
              <CodeXml className="size-4" /> Kode sumber
            </a>
          </div>

          <p className="mt-6 text-center text-xs text-ink-500 dark:text-ink-400">
            Dibuat dengan React, TypeScript & Tailwind · Tekan{' '}
            <kbd className="rounded border border-black/10 px-1 py-0.5 font-mono text-[10px] dark:border-white/15">
              Ctrl
            </kbd>
            +
            <kbd className="rounded border border-black/10 px-1 py-0.5 font-mono text-[10px] dark:border-white/15">
              K
            </kbd>{' '}
            untuk buka-tutup widget
          </p>
        </div>
      </footer>
    </div>
  )
}
