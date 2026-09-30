import { useEffect, useState, type ReactNode } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
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

export function Shell({ onLaunch, active, theme, onToggleTheme, children }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative min-h-screen">
      <Backdrop />

      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white dark:focus:bg-white dark:focus:text-ink-950"
      >
        Lompat ke konten
      </a>

      {/* ---------------------------------------------------------- navbar */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
          scrolled || open
            ? 'border-ink-200 bg-white/80 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/80'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-2.5"
            aria-label="CikitoAI, ke beranda"
          >
            <Logo />
            <span className="text-[0.9375rem] font-semibold tracking-tight text-ink-950 dark:text-white">
              Cikito<span className="text-ink-400 dark:text-ink-500">AI</span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="ml-4 hidden items-center gap-0.5 lg:flex">
            {NAV_ROUTES.map((r) => {
              const isActive = pathname === r.path
              return (
                <Link
                  key={r.path}
                  to={r.path}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm transition-colors duration-200',
                    isActive
                      ? 'bg-ink-100 font-medium text-ink-950 dark:bg-ink-900 dark:text-white'
                      : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-950 dark:text-ink-400 dark:hover:bg-ink-900/70 dark:hover:text-white',
                  )}
                >
                  {r.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              className="btn btn-ghost size-9 rounded-lg p-0"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <button type="button" onClick={onLaunch} className="btn btn-primary btn-sm">
              {active ? 'Buka widget' : 'Jalankan'}
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              className="btn btn-ghost size-9 rounded-lg p-0 lg:hidden"
            >
              {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </div>

        {/* menu ponsel */}
        {open && (
          <div className="animate-fade-in border-t border-ink-200 bg-white px-4 pt-2 pb-4 lg:hidden dark:border-ink-800 dark:bg-ink-950">
            <nav aria-label="Navigasi ponsel" className="grid gap-0.5">
              {NAV_ROUTES.map((r) => {
                const Icon = r.icon
                const isActive = pathname === r.path
                return (
                  <Link
                    key={r.path}
                    to={r.path}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-ink-100 font-medium text-ink-950 dark:bg-ink-900 dark:text-white'
                        : 'text-ink-600 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-900/60',
                    )}
                  >
                    <Icon className={cn('size-4', isActive && 'text-brand-600 dark:text-brand-400')} />
                    {r.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      <main id="konten" className="relative">
        {children}
      </main>

      <Footer onLaunch={onLaunch} active={active} />
    </div>
  )
}

/* -------------------------------------------------------------------- */

function Logo() {
  return (
    <span className="relative grid size-7 shrink-0 place-items-center rounded-[9px] bg-ink-950 transition-transform duration-200 group-hover:scale-105 dark:bg-white">
      <span className="size-2 rounded-full bg-brand-400 dark:bg-brand-500" />
    </span>
  )
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-pattern mask-radial absolute inset-0 opacity-70" />
      <div className="absolute -top-40 left-1/2 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand-500/[0.07] blur-[120px] dark:bg-brand-500/[0.09]" />
    </div>
  )
}

function Footer({ onLaunch, active }: { onLaunch: () => void; active: boolean }) {
  return (
    <footer className="relative mt-24 border-t border-ink-200 dark:border-ink-800">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-[9px] bg-ink-950 dark:bg-white">
                <span className="size-2 rounded-full bg-brand-400 dark:bg-brand-500" />
              </span>
              <span className="text-[0.9375rem] font-semibold tracking-tight text-ink-950 dark:text-white">
                Cikito<span className="text-ink-400 dark:text-ink-500">AI</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Widget AI mengambang yang bisa digeser, diubah ukurannya, dan ditempel di website mana
              pun. API key tetap di perangkatmu.
            </p>
            <button
              type="button"
              onClick={onLaunch}
              className="btn btn-secondary btn-sm mt-5"
            >
              {active ? 'Buka widget' : 'Jalankan'}
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-ink-950 uppercase dark:text-white">
              Halaman
            </h3>
            <nav aria-label="Navigasi footer" className="mt-4 grid gap-2.5">
              {NAV_ROUTES.map((r) => (
                <Link
                  key={r.path}
                  to={r.path}
                  className="text-sm text-ink-500 transition-colors hover:text-ink-950 dark:text-ink-400 dark:hover:text-white"
                >
                  {r.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-ink-950 uppercase dark:text-white">
              Pintasan
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500 dark:text-ink-400">
              <li className="flex items-center gap-2">
                <kbd className="kbd">Ctrl</kbd>
                <span className="text-ink-400">+</span>
                <kbd className="kbd">K</kbd>
                <span className="ml-1">buka–tutup widget</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="kbd">Esc</kbd>
                <span className="ml-1">kecilkan ke bubble</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="kbd">Enter</kbd>
                <span className="ml-1">kirim pesan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 sm:flex-row dark:border-ink-800">
          <p className="text-xs text-ink-500 dark:text-ink-400">
            © {new Date().getFullYear()} CikitoAI · Dibuat dengan React, Vite, dan Tailwind CSS.
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            API key disimpan lokal di peramban — tidak pernah ikut tersimpan di server.
          </p>
        </div>
      </div>
    </footer>
  )
}
