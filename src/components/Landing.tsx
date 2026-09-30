import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  Code2,
  CodeXml,
  KeyRound,
  Maximize2,
  Menu,
  MessageSquare,
  Minimize2,
  Monitor,
  Moon,
  Move,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react'
import { PROVIDERS } from '../lib/providers'
import { cn } from '../lib/utils'
import { Distribusi } from './Distribusi'

interface Props {
  onLaunch: () => void
  active: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const FEATURES = [
  {
    icon: Move,
    title: 'Geser ke mana saja',
    desc: 'Tarik bubble dengan mouse atau jari. Lepas, dan ia menempel rapi ke tepi layar terdekat.',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    icon: Maximize2,
    title: 'Ukuran bebas diatur',
    desc: 'Tarik 8 titik di tepi panel, pakai preset Kecil/Sedang/Besar, layar penuh, plus skala teks 80–150%.',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Minimize2,
    title: 'Buka–tutup instan',
    desc: 'Kecilkan jadi bubble, tekan Esc, atau tarik ke bawah di ponsel. Posisi & ukuran selalu diingat.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Boxes,
    title: 'Model AI apa pun',
    desc: 'OpenAI, Claude, Gemini, Groq, OpenRouter, DeepSeek, Mistral, xAI, Ollama, atau endpoint kustom.',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    icon: Zap,
    title: 'Jawaban streaming',
    desc: 'Teks mengalir kata demi kata lewat SSE, bisa dihentikan kapan saja, lengkap dengan proses berpikir.',
    accent: 'from-rose-500 to-pink-600',
  },
  {
    icon: ShieldCheck,
    title: 'Kunci tetap milikmu',
    desc: 'API key hanya tersimpan di browser dan diteruskan langsung ke penyedia — tidak pernah ditulis ke disk.',
    accent: 'from-indigo-500 to-blue-700',
  },
]

const STEPS = [
  {
    icon: Play,
    title: 'Tekan “Jalankan”',
    desc: 'Sebuah bubble bulat kecil muncul di sudut layar. Geser ke posisi favoritmu.',
  },
  {
    icon: KeyRound,
    title: 'Masukkan API AI',
    desc: 'Klik bubble, pilih penyedia, tempel API key, lalu ketik nama model apa pun yang kamu mau.',
  },
  {
    icon: MessageSquare,
    title: 'Mulai ngobrol',
    desc: 'Tekan “Jalankan” sekali lagi dan panel berubah menjadi ruang chat penuh fitur.',
  },
]

const FAQS = [
  {
    q: 'Model AI apa saja yang didukung?',
    a: 'Semua yang berbicara dalam salah satu dari tiga format: OpenAI-compatible (/chat/completions), Anthropic Messages, dan Google Gemini. Karena kolom model bebas diisi, model baru yang rilis besok pun langsung bisa dipakai tanpa update aplikasi.',
  },
  {
    q: 'Apakah API key saya aman?',
    a: 'Key disimpan di localStorage browser kamu. Saat mengirim pesan, key diteruskan sekali lewat backend hanya untuk memanggil penyedia (agar tidak terhalang CORS), tanpa pernah ditulis ke disk maupun dicatat di log.',
  },
  {
    q: 'Bisa dipakai tanpa API key?',
    a: 'Bisa. Pilih “Mode Demo” untuk mencoba seluruh tampilan dengan jawaban simulasi lokal. Untuk jawaban sungguhan, sambungkan penyedia pilihanmu.',
  },
  {
    q: 'Bagaimana di ponsel?',
    a: 'Bubble tetap bisa digeser, dan panel otomatis berubah jadi bottom sheet lebar penuh yang bisa ditarik ke bawah untuk ditutup. Semua kontrol dibuat dengan target sentuh yang nyaman.',
  },
  {
    q: 'Apakah percakapan saya tersimpan?',
    a: 'Riwayat chat, posisi bubble, ukuran panel, dan pengaturan tersimpan di browser sehingga tetap ada saat halaman dimuat ulang. Tombol “Obrolan baru” menghapusnya kapan saja.',
  },
]

export function Landing({ onLaunch, active, theme, onToggleTheme }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const nav = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#cara-kerja', label: 'Cara kerja' },
    { href: '#penyedia', label: 'Penyedia' },
    { href: '#bawa-ke-mana-saja', label: 'Bawa ke mana saja' },
    { href: '#faq', label: 'FAQ' },
  ]

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

      {/* ----------------------------------------------------------- navbar */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'py-2' : 'py-3 sm:py-4',
        )}
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-5">
          <nav
            className={cn(
              'flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-300 sm:px-4',
              scrolled
                ? 'glass shadow-lg shadow-black/[0.04]'
                : 'border border-transparent bg-transparent',
            )}
          >
            <a href="#" className="flex shrink-0 items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-md">
                <Sparkles className="size-[18px]" />
              </span>
              <span className="text-base font-extrabold tracking-tight">
                Cikito<span className="text-gradient">AI</span>
              </span>
            </a>

            <div className="mx-auto hidden items-center gap-1 md:flex">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-black/[0.05] hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {n.label}
                </a>
              ))}
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
                className="grid size-9 place-items-center rounded-xl text-ink-600 transition hover:bg-black/[0.05] md:hidden dark:text-ink-300 dark:hover:bg-white/10"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>

          {menuOpen && (
            <div className="glass mt-2 animate-fade-in space-y-1 rounded-2xl p-2 shadow-xl md:hidden">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-black/[0.05] dark:text-ink-200 dark:hover:bg-white/10"
                >
                  {n.label}
                </a>
              ))}
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

      {/* ------------------------------------------------------------- hero */}
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
              Bubble bulat yang bisa <strong className="text-ink-900 dark:text-white">digeser</strong>,
              panel yang bisa <strong className="text-ink-900 dark:text-white">diubah ukurannya</strong>,{' '}
              <strong className="text-ink-900 dark:text-white">dibuka–tutup</strong>, dan terhubung ke{' '}
              <strong className="text-ink-900 dark:text-white">model AI apa pun</strong> lewat API key milikmu.
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

              <a
                href="#cara-kerja"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-6 py-4 text-base font-semibold text-ink-700 backdrop-blur transition hover:border-brand-300 hover:text-brand-700 sm:w-auto dark:border-white/12 dark:bg-white/5 dark:text-ink-200 dark:hover:text-white"
              >
                Lihat cara kerjanya
              </a>
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

      {/* --------------------------------------------------------- penyedia */}
      <section id="penyedia" className="relative py-8 sm:py-10">
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
      </section>

      {/* ------------------------------------------------------------ fitur */}
      <section id="fitur" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Fitur"
          title="Dibuat semaksimal mungkin"
          subtitle="Setiap detail interaksi digarap: dari fisika geser, pegangan ubah ukuran, sampai render Markdown dan streaming token."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="group relative animate-fade-up overflow-hidden rounded-2xl border border-black/[0.07] bg-white/70 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-brand-400/30"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={cn(
                  'grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                  f.accent,
                )}
              >
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{f.desc}</p>
              <div className="pointer-events-none absolute -right-8 -bottom-8 size-24 rounded-full bg-brand-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- cara kerja */}
      <section id="cara-kerja" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Cara kerja"
          title="Tiga langkah, tiga puluh detik"
          subtitle="Tidak ada instalasi, tidak ada pendaftaran. Cukup tekan tombol, tempel API key, lalu bertanya."
        />

        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
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

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onLaunch}
            className="group flex items-center gap-2 rounded-2xl bg-ink-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 dark:bg-white dark:text-ink-900"
          >
            <Play className="size-4 fill-current" />
            Coba langsung di halaman ini
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ------------------------------------------------- bawa ke mana saja */}
      <Distribusi />

      {/* -------------------------------------------------------- responsif */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-black/[0.07] bg-gradient-to-br from-brand-500/[0.09] via-transparent to-cyan-500/[0.09] p-8 sm:p-12 dark:border-white/[0.08]">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-300">
                Responsif
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Nyaman dari layar 320px sampai ultrawide
              </h2>
              <p className="mt-4 text-ink-600 dark:text-ink-300">
                Di desktop ia panel mengambang yang bisa digeser & diubah ukurannya. Di ponsel ia berubah
                jadi bottom sheet lebar penuh dengan pegangan tarik. Semua otomatis.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: Monitor, t: 'Desktop', d: 'Panel mengambang, 8 titik resize, layar penuh, pintasan Esc.' },
                  { icon: Smartphone, t: 'Ponsel', d: 'Bottom sheet, tarik ke bawah untuk menutup, target sentuh lega.' },
                  { icon: Code2, t: 'Konten kaya', d: 'Markdown, tabel, dan blok kode dengan tombol salin.' },
                ].map((r) => (
                  <li key={r.t} className="flex gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-white/10 dark:text-brand-300">
                      <r.icon className="size-4" />
                    </span>
                    <span>
                      <strong className="block text-sm font-bold">{r.t}</strong>
                      <span className="text-sm text-ink-600 dark:text-ink-400">{r.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <DeviceMock />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering muncul" />
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const open = faqOpen === i
            return (
              <div
                key={f.q}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-200',
                  open
                    ? 'border-brand-400/50 bg-white/80 shadow-lg dark:bg-white/[0.05]'
                    : 'border-black/[0.07] bg-white/60 dark:border-white/[0.08] dark:bg-white/[0.02]',
                )}
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <span className="flex-1 text-sm font-bold sm:text-base">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-ink-400 transition-transform duration-200',
                      open && 'rotate-180 text-brand-500',
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------- penutup */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-cyan-500 px-6 py-14 text-center shadow-2xl sm:px-12">
          <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Siap mencoba sekarang?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">
              Tekan tombol di bawah — bubble akan muncul di sudut layar ini juga. Tanpa API key pun bisa,
              pakai Mode Demo.
            </p>
            <button
              type="button"
              onClick={onLaunch}
              className="group mx-auto mt-8 flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-brand-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
            >
              <Play className="size-5 fill-current" />
              Jalankan CikitoAI
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- footer */}
      <footer className="border-t border-black/[0.07] py-10 dark:border-white/[0.07]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm font-extrabold">
              Cikito<span className="text-gradient">AI</span>
            </span>
          </div>
          <p className="text-center text-xs text-ink-500 dark:text-ink-400">
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
          <a
            href="https://github.com/kelvin1122331/cikitoai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
          >
            <CodeXml className="size-4" /> Kode sumber
          </a>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------ komponen kecil */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-300">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-ink-600 dark:text-ink-300">{subtitle}</p>}
    </div>
  )
}

function HeroMock() {
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

function DeviceMock() {
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
