import { ArrowRight, ArrowUpRight, Check, Play } from 'lucide-react'
import { Link, usePageMeta } from '../lib/router'
import { PROVIDERS } from '../lib/providers'
import { CtaBanner, HeroMock, SectionTitle } from '../site/parts'
import { NAV_ROUTES, ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

const TEASER: Record<string, string> = {
  '/fitur': 'Geser, ubah ukuran, buka–tutup, streaming, Markdown, dan model AI apa pun.',
  '/cara-kerja': 'Tiga langkah, tiga puluh detik: Jalankan, isi API, lalu ngobrol.',
  '/penyedia': '13 preset penyedia plus endpoint kustom — kolom model bebas diisi.',
  '/bawa-ke-mana-saja': 'Tempel di situs lain, bookmarklet, jendela mengambang, ekstensi, PWA.',
  '/faq': 'Soal model, keamanan API key, mode demo, dan penggunaan di ponsel.',
}

const FACTS = [
  { k: '13', v: 'penyedia preset' },
  { k: '3', v: 'format API dinormalisasi' },
  { k: '0', v: 'pendaftaran & pelacakan' },
  { k: '< 60 kB', v: 'skrip tempel (gzip)' },
]

export function Beranda({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/']
  usePageMeta(route.title, route.description)

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40 lg:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div>
            <span className="chip animate-fade-up">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
              </span>
              Widget AI mengambang · siap tempel di website apa pun
            </span>

            <h1
              className="mt-6 animate-fade-up text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-ink-950 sm:text-6xl dark:text-white"
              style={{ animationDelay: '60ms' }}
            >
              Satu tombol Jalankan,
              <br className="hidden sm:block" />{' '}
              <span className="text-ink-400 dark:text-ink-500">asisten AI langsung mengambang.</span>
            </h1>

            <p
              className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-ink-600 sm:text-lg dark:text-ink-400"
              style={{ animationDelay: '110ms' }}
            >
              Bubble bulat yang bisa digeser, panel yang bisa diubah ukurannya dan dibuka–tutup,
              terhubung ke model AI apa pun lewat API key milikmu sendiri.
            </p>

            <div
              className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '160ms' }}
            >
              <button
                type="button"
                onClick={onLaunch}
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                <Play className="size-4 fill-current" />
                {active ? 'Buka widget sekarang' : 'Jalankan sekarang'}
              </button>
              <Link to="/cara-kerja" className="btn btn-secondary btn-lg w-full sm:w-auto">
                Lihat cara kerja
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <ul
              className="mt-8 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400"
              style={{ animationDelay: '210ms' }}
            >
              {['Tanpa registrasi', 'Ada Mode Demo', 'Gratis & open source'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-3.5 text-brand-600 dark:text-brand-400" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroMock />
        </div>
      </section>

      {/* -------------------------------------------------------- penyedia */}
      <section className="border-y border-ink-200 bg-ink-50/50 py-10 dark:border-ink-800 dark:bg-ink-900/20">
        <p className="mb-6 text-center text-xs text-ink-500 dark:text-ink-400">
          Bekerja dengan penyedia mana pun — OpenAI, Anthropic, Google, dan puluhan lainnya
        </p>
        <div className="mask-fade-x relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-2.5 hover:[animation-play-state:paused]">
            {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
              <span
                key={`${p.id}-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm text-ink-600 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-300"
              >
                <span className="font-mono text-[10px] text-ink-400">{p.short}</span>
                <span className="whitespace-nowrap">{p.name}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/penyedia"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-950 transition-opacity hover:opacity-70 dark:text-white"
          >
            Lihat semua penyedia
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------ menu utama */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionTitle
          eyebrow="Jelajahi"
          title="Setiap topik punya halamannya sendiri"
          desc="Tidak ada halaman panjang yang harus digulir terus-menerus. Pilih yang kamu butuhkan — masing-masing terbuka sebagai halaman terpisah."
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_ROUTES.map((r, i) => {
            const Icon = r.icon
            return (
              <Link
                key={r.path}
                to={r.path}
                className="card card-hover group animate-fade-up p-6"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-ink-50 text-ink-700 transition-colors duration-200 group-hover:border-brand-500/30 group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300 dark:group-hover:text-brand-400">
                    <Icon className="size-4" />
                  </span>
                  <ArrowUpRight className="size-4 text-ink-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-950 dark:text-ink-700 dark:group-hover:text-white" />
                </div>
                <h3 className="mt-5 text-base font-medium text-ink-950 dark:text-white">
                  {r.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                  {TEASER[r.path]}
                </p>
                <span className="mt-4 block font-mono text-[0.7rem] text-ink-400 dark:text-ink-600">
                  {r.path}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------- angka */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="card grid grid-cols-2 gap-px overflow-hidden bg-ink-200 lg:grid-cols-4 dark:bg-ink-800">
          {FACTS.map((f) => (
            <div key={f.v} className="bg-white px-6 py-8 dark:bg-ink-950">
              <div className="text-3xl font-semibold tracking-tight text-ink-950 tabular-nums dark:text-white">
                {f.k}
              </div>
              <div className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.v}</div>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner onLaunch={onLaunch} active={active} />
    </>
  )
}
