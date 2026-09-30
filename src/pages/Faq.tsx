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

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="card divide-y divide-ink-200 overflow-hidden dark:divide-ink-800">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-4 px-6 py-5 text-left transition-colors duration-200',
                    isOpen
                      ? 'text-ink-950 dark:text-white'
                      : 'text-ink-700 hover:bg-ink-50/70 dark:text-ink-300 dark:hover:bg-ink-900/40',
                  )}
                >
                  <span className="flex-1 text-sm font-medium sm:text-base">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 text-ink-400 transition-transform duration-300',
                      isOpen && 'rotate-180 text-brand-600 dark:text-brand-400',
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
                    <p className="px-6 pb-5 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-sm text-ink-500 dark:text-ink-400">
          Masih penasaran soal menempelkannya di situs lain?{' '}
          <Link to="/bawa-ke-mana-saja" className="link">
            Baca halaman Bawa ke mana saja
          </Link>
          .
        </p>
      </section>

      <CtaBanner onLaunch={onLaunch} active={active} />
      <Pager path={route.path} />
    </>
  )
}
