import { ArrowLeft } from 'lucide-react'
import { Link, usePageMeta } from '../lib/router'
import { NAV_ROUTES } from '../site/routes'

export function NotFound({ path }: { path: string }) {
  usePageMeta('Halaman tidak ditemukan — CikitoAI')

  return (
    <section className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
      <span className="font-mono text-sm text-ink-400 dark:text-ink-600">404</span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl dark:text-white">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 text-ink-600 dark:text-ink-400">
        Alamat <code className="font-mono text-sm text-ink-950 dark:text-white">{path}</code> tidak
        ada di situs ini. Mungkin salah ketik?
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {NAV_ROUTES.map((r) => (
          <Link key={r.path} to={r.path} className="btn btn-secondary btn-sm">
            {r.label}
          </Link>
        ))}
      </div>

      <Link to="/" className="btn btn-primary btn-md mt-8">
        <ArrowLeft className="size-4" />
        Kembali ke beranda
      </Link>
    </section>
  )
}
