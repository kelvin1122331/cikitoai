import { ArrowRight, KeyRound, MessageSquare, Play, Settings2, Sparkles } from 'lucide-react'
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
    d: 'Pilih “Mode Demo” untuk mencoba seluruh alur dengan jawaban simulasi lokal, tanpa biaya dan tanpa pendaftaran.',
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
        subtitle="Tidak ada instalasi, tidak ada pendaftaran. Cukup tekan tombol, tempel API key, lalu bertanya."
      >
        <button
          type="button"
          onClick={onLaunch}
          className="group mx-auto flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_-12px_rgba(109,43,245,0.85)] transition hover:-translate-y-0.5"
        >
          <Play className="size-4 fill-current" />
          {active ? 'Buka widget' : 'Coba langsung di halaman ini'}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative grid gap-4 md:grid-cols-3">
          <div className="absolute inset-x-[16%] top-11 hidden h-px bg-gradient-to-r from-brand-400/0 via-brand-400/50 to-brand-400/0 md:block" />
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative animate-fade-up rounded-2xl border border-black/[0.07] bg-white/70 p-6 text-center backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.03]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="relative mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg">
                <s.icon className="size-5" />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border-2 border-white bg-white text-xs font-extrabold text-brand-600 shadow dark:border-ink-950 dark:bg-ink-900">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {DETAILS.map((d) => (
            <div
              key={d.t}
              className="flex gap-3 rounded-2xl border border-black/[0.07] bg-white/60 p-5 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.02]"
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <d.icon className="size-4" />
              </span>
              <span>
                <strong className="block text-sm font-bold">{d.t}</strong>
                <span className="text-sm leading-relaxed text-ink-600 dark:text-ink-400">{d.d}</span>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-500 dark:text-ink-400">
          Sudah paham alurnya?{' '}
          <Link
            to="/penyedia"
            className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
          >
            Lihat daftar penyedia
          </Link>{' '}
          atau{' '}
          <Link
            to="/bawa-ke-mana-saja"
            className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
          >
            bawa widget ke website lain
          </Link>
          .
        </p>
      </section>

      <Pager path={route.path} />
    </>
  )
}
