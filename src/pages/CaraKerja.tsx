import { KeyRound, MessageSquare, Play, Settings2, Sparkles } from 'lucide-react'
import { Link, usePageMeta } from '../lib/router'
import { PageHero, Pager } from '../site/parts'
import { ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

const STEPS = [
  {
    icon: Play,
    title: 'Tekan “Jalankan”',
    desc: 'Sebuah bubble bulat kecil muncul di sudut layar. Geser ke posisi favoritmu — ia akan menempel ke tepi terdekat.',
  },
  {
    icon: KeyRound,
    title: 'Masukkan API AI',
    desc: 'Klik bubble, pilih penyedia, tempel API key, lalu ketik nama model apa pun yang kamu mau.',
  },
  {
    icon: MessageSquare,
    title: 'Mulai ngobrol',
    desc: 'Tekan “Jalankan” sekali lagi dan panel berubah menjadi ruang chat penuh fitur dengan jawaban mengalir.',
  },
]

const DETAILS = [
  {
    icon: Settings2,
    t: 'Kolom model bebas diisi',
    d: 'Ada saran model per penyedia, tapi kamu tetap boleh mengetik nama model apa pun — termasuk yang baru rilis besok.',
  },
  {
    icon: Sparkles,
    t: 'Tanpa API key pun bisa',
    d: 'Pilih Mode Demo untuk mencoba seluruh alur dengan jawaban simulasi lokal, tanpa biaya dan tanpa pendaftaran.',
  },
  {
    icon: KeyRound,
    t: 'Uji koneksi dulu',
    d: 'Tombol “Tes koneksi” mengirim satu pesan pendek untuk memastikan key dan nama model benar sebelum kamu mulai.',
  },
]

export function CaraKerja({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/cara-kerja']
  usePageMeta(route.title, route.description)

  return (
    <>
      <PageHero
        route={route}
        title="Tiga langkah, tiga puluh detik"
        subtitle="Tidak ada instalasi dan tidak ada pendaftaran. Cukup tekan tombol, tempel API key, lalu bertanya."
      >
        <button type="button" onClick={onLaunch} className="btn btn-primary btn-lg">
          <Play className="size-4 fill-current" />
          {active ? 'Buka widget' : 'Coba langsung di halaman ini'}
        </button>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="card animate-fade-up relative p-7"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-ink-50 text-ink-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
                  <s.icon className="size-4" />
                </span>
                <span className="font-mono text-xs text-ink-400 dark:text-ink-600">
                  0{i + 1}
                </span>
              </div>
              <h2 className="mt-5 text-base font-medium text-ink-950 dark:text-white">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {DETAILS.map((d) => (
            <div key={d.t} className="card flex gap-3.5 p-5">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <d.icon className="size-4" />
              </span>
              <span>
                <strong className="block text-sm font-medium text-ink-950 dark:text-white">
                  {d.t}
                </strong>
                <span className="mt-1 block text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                  {d.d}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink-500 dark:text-ink-400">
          Sudah paham alurnya? <Link to="/penyedia" className="link">Lihat daftar penyedia</Link> atau{' '}
          <Link to="/bawa-ke-mana-saja" className="link">
            bawa widget ke website lain
          </Link>
          .
        </p>
      </section>

      <Pager path={route.path} />
    </>
  )
}
