import { ArrowLeft, Compass } from 'lucide-react'
import { Link, usePageMeta } from '../lib/router'
import { NAV_ROUTES } from '../site/routes'

export function NotFound({ path }: { path: string }) {
  usePageMeta('Halaman tidak ditemukan — CikitoAI')

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg">
        <Compass className="size-7" />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight">404</h1>
      <p className="mt-3 text-ink-600 dark:text-ink-300">
        Halaman <code className="font-mono text-sm text-brand-600 dark:text-brand-300">{path}</code>{' '}
        tidak ada. Mungkin salah ketik?
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {NAV_ROUTES.map((r) => (
          <Link
            key={r.path}
            to={r.path}
            className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-white/12 dark:bg-white/5 dark:text-ink-200 dark:hover:text-white"
          >
            {r.label}
          </Link>
        ))}
      </div>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
      >
        <ArrowLeft className="size-4" />
        Kembali ke beranda
      </Link>
    </section>
  )
}
