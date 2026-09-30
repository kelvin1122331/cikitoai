import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, usePageMeta } from '../lib/router'
import { cn } from '../lib/utils'
import { CtaBanner, PageHero, Pager } from '../site/parts'
import { ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

const FAQS = [
  {
    q: 'Model AI apa saja yang didukung?',
    a: 'Semua yang berbicara dalam salah satu dari tiga format: OpenAI-compatible (/chat/completions), Anthropic Messages, dan Google Gemini. Karena kolom model bebas diisi, model baru yang rilis besok pun langsung bisa dipakai tanpa update aplikasi.',
  },
  {
    q: 'Apakah API key saya aman?',
    a: 'Key disimpan di localStorage browser kamu. Saat mengirim pesan, key diteruskan sekali lewat backend hanya untuk memanggil penyedia (agar tidak terhalang CORS), tanpa pernah ditulis ke disk maupun dicatat di log. Di mode langsung dan ekstensi, key bahkan tidak melewati server sama sekali.',
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
  {
    q: 'Apakah widget tetap ada kalau saya keluar dari peramban?',
    a: 'Jendela mengambang ikut tertutup bersama tab yang membukanya. Kalau kamu memasang CikitoAI sebagai aplikasi (PWA), ia punya jendela dan ikon sendiri yang tetap terbuka meski semua jendela peramban ditutup. Apa pun yang terjadi, riwayat dan pengaturan tidak hilang.',
  },
]

export function Faq({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/faq']
  usePageMeta(route.title, route.description)
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <PageHero
        route={route}
        title="Pertanyaan yang sering muncul"
        subtitle="Soal model, keamanan API key, mode demo, penggunaan di ponsel, dan apa yang bertahan saat peramban ditutup."
      />

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.q}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-200',
                  isOpen
                    ? 'border-brand-400/50 bg-white/80 shadow-lg dark:bg-white/[0.05]'
                    : 'border-black/[0.07] bg-white/60 dark:border-white/[0.08] dark:bg-white/[0.02]',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <span className="flex-1 text-sm font-bold sm:text-base">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-ink-400 transition-transform duration-200',
                      isOpen && 'rotate-180 text-brand-500',
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
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

        <p className="mt-8 text-center text-sm text-ink-500 dark:text-ink-400">
          Masih penasaran soal menempelkannya di situs lain?{' '}
          <Link
            to="/bawa-ke-mana-saja"
            className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
          >
            Baca halaman “Bawa ke mana saja”
          </Link>
          .
        </p>
      </section>

      <CtaBanner onLaunch={onLaunch} active={active} />
      <Pager path={route.path} />
    </>
  )
}
