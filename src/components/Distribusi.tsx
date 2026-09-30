import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AppWindow,
  Bookmark,
  Check,
  Blocks,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  PictureInPicture2,
  Puzzle,
  MonitorDown,
  Sparkles,
  TerminalSquare,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useInstallApp } from '../hooks/useInstallApp'

/**
 * Bagian "Bawa ke mana saja" — empat cara memakai widget di luar situs ini:
 * tempel <script>, bookmarklet, jendela mengambang, dan ekstensi peramban.
 */

type TabId = 'script' | 'bookmarklet' | 'popout' | 'extension' | 'app'

const TABS: { id: TabId; label: string; icon: typeof Globe }[] = [
  { id: 'script', label: 'Tempel di website', icon: Code2 },
  { id: 'bookmarklet', label: 'Bookmarklet', icon: Bookmark },
  { id: 'popout', label: 'Jendela mengambang', icon: PictureInPicture2 },
  { id: 'extension', label: 'Ekstensi peramban', icon: Puzzle },
  { id: 'app', label: 'Aplikasi desktop', icon: AppWindow },
]

function useOrigin() {
  const [origin, setOrigin] = useState('https://cikitoai.example')
  useEffect(() => setOrigin(window.location.origin), [])
  return origin
}

function CopyButton({ text, label = 'Salin' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          /* clipboard bisa ditolak — abaikan */
        }
        setDone(true)
        window.setTimeout(() => setDone(false), 1600)
      }}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition',
        done
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
          : 'border-black/10 bg-white/70 text-ink-600 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-ink-200 dark:hover:bg-white/10',
      )}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Tersalin' : label}
    </button>
  )
}

function Code({ children, copy }: { children: string; copy?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-black/10 bg-ink-950/95 dark:border-white/10">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-wide text-ink-400 uppercase">
          <TerminalSquare className="size-3.5" /> Salin–tempel
        </span>
        <CopyButton text={copy ?? children} />
      </div>
      <pre className="thin-scrollbar overflow-x-auto p-3 text-[0.78rem] leading-relaxed text-ink-100">
        <code>{children}</code>
      </pre>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-black/[0.06] py-2 last:border-0 sm:flex-row sm:gap-4 dark:border-white/[0.07]">
      <code className="shrink-0 font-mono text-[0.75rem] font-bold text-brand-600 sm:w-44 dark:text-brand-300">
        {k}
      </code>
      <span className="text-sm text-ink-600 dark:text-ink-400">{v}</span>
    </div>
  )
}

export function Distribusi() {
  const origin = useOrigin()
  const [tab, setTab] = useState<TabId>('script')
  const app = useInstallApp()

  const snippet = `<!-- Tempelkan sebelum </body> -->
<script
  src="${origin}/embed/cikito-widget.js"
  data-api-base="${origin}"
  data-transport="auto"
  data-theme="auto"
  defer
></script>`

  const bookmarklet = useMemo(
    () =>
      `javascript:(function(){if(window.CikitoAI){window.CikitoAI.toggle();return}var s=document.createElement('script');s.src='${origin}/embed/cikito-widget.js';s.dataset.apiBase='${origin}';s.dataset.transport='auto';s.dataset.theme='auto';s.dataset.open='true';document.body.appendChild(s)})()`,
    [origin],
  )

  /**
   * React 19 memblokir href "javascript:" demi keamanan, jadi atribut dipasang
   * langsung ke elemen. Bookmarklet hanya berguna kalau bisa diseret ke bilah
   * bookmark, dan itu butuh href sungguhan.
   */
  const bookmarkRef = useCallback(
    (el: HTMLAnchorElement | null) => {
      el?.setAttribute('href', bookmarklet)
    },
    [bookmarklet],
  )

  const openPopout = async () => {
    const url = `${origin}/?cikito=popout`
    const dpip = (window as unknown as { documentPictureInPicture?: { requestWindow: (o?: { width?: number; height?: number }) => Promise<Window> } })
      .documentPictureInPicture
    if (dpip?.requestWindow) {
      try {
        const pip = await dpip.requestWindow({ width: 420, height: 680 })
        pip.document.body.style.cssText = 'margin:0;background:#0b0e1a;overflow:hidden'
        const frame = pip.document.createElement('iframe')
        frame.src = url
        frame.setAttribute('title', 'CikitoAI')
        frame.style.cssText = 'display:block;border:0;width:100%;height:100vh'
        pip.document.body.appendChild(frame)
        return
      } catch {
        /* jatuh ke jendela biasa */
      }
    }
    window.open(url, 'cikitoai-popout', 'popup=yes,width=420,height=680')
  }

  return (
    <section id="bawa-ke-mana-saja" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-300">
          Bawa ke mana saja
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Satu bubble, di website mana pun
        </h2>
        <p className="mt-4 text-ink-600 dark:text-ink-300">
          Widget yang sama bisa keluar dari halaman ini: tempel di situs lain, panggil lewat
          bookmarklet, lepas jadi jendela mengambang di atas aplikasi lain, atau pasang sebagai
          ekstensi peramban.
        </p>
      </div>

      {/* Tab */}
      <div className="mask-fade-x mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="mx-auto flex w-max gap-1.5 rounded-2xl border border-black/[0.07] bg-white/70 p-1.5 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold whitespace-nowrap transition',
                tab === t.id
                  ? 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md'
                  : 'text-ink-500 hover:bg-black/[0.04] dark:text-ink-300 dark:hover:bg-white/5',
              )}
              aria-pressed={tab === t.id}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-black/[0.07] bg-white/70 p-5 backdrop-blur sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.03]">
        {/* ------------------------------------------------------- script */}
        {tab === 'script' && (
          <div className="grid animate-fade-in gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Globe className="size-5 text-brand-500" />
                Satu baris skrip, selesai
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Bundel mandiri (±108&nbsp;kB gzip) yang merender seluruh widget di dalam{' '}
                <strong>Shadow DOM</strong>. CSS situsmu tidak bocor masuk, CSS widget tidak bocor
                keluar — tampilannya persis seperti di halaman ini.
              </p>
              <div className="mt-4">
                <Code>{snippet}</Code>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href="/demo-tempel.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-ink-900"
                >
                  <ExternalLink className="size-4" />
                  Lihat contoh situs tuan rumah
                </a>
                <span className="text-xs text-ink-500 dark:text-ink-400">
                  Halaman biasa tanpa Tailwind — bukti widget berdiri sendiri.
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-wide text-ink-500 uppercase dark:text-ink-400">
                Atribut yang tersedia
              </h4>
              <div className="mt-2">
                <Row k="data-api-base" v="Asal backend CikitoAI. Default: asal berkas skrip." />
                <Row
                  k="data-transport"
                  v="auto (bawaan) · proxy — lewat backend · direct — browser langsung ke penyedia."
                />
                <Row k="data-theme" v="auto (bawaan) · light · dark." />
                <Row k="data-open" v="true untuk langsung membuka panel, bukan bubble." />
                <Row k="data-hotkey" v="true untuk mengaktifkan pintasan Ctrl/Cmd + K." />
                <Row k="data-provider / data-model" v="Isian awal penyedia & nama model." />
                <Row k="data-z-index" v="Ubah tumpukan bila situs punya elemen sangat tinggi." />
              </div>
              <p className="mt-4 rounded-xl bg-brand-500/[0.07] p-3 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
                Kontrol lewat JavaScript juga bisa:{' '}
                <code className="font-mono text-brand-600 dark:text-brand-300">
                  CikitoAI.open()
                </code>
                ,{' '}
                <code className="font-mono text-brand-600 dark:text-brand-300">
                  CikitoAI.close()
                </code>
                ,{' '}
                <code className="font-mono text-brand-600 dark:text-brand-300">
                  CikitoAI.toggle()
                </code>
                ,{' '}
                <code className="font-mono text-brand-600 dark:text-brand-300">
                  CikitoAI.destroy()
                </code>
                .
              </p>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- bookmarklet */}
        {tab === 'bookmarklet' && (
          <div className="grid animate-fade-in items-start gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Bookmark className="size-5 text-brand-500" />
                Panggil di website orang lain
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Seret tombol ungu di bawah ini ke bilah bookmark peramban. Klik bookmark itu saat
                membuka website apa pun — bubble CikitoAI langsung muncul di sana, tanpa perlu
                mengubah website tersebut.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  ref={bookmarkRef}
                  onClick={(e) => e.preventDefault()}
                  draggable
                  title="Seret saya ke bilah bookmark"
                  className="inline-flex cursor-grab items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg active:cursor-grabbing"
                >
                  <Sparkles className="size-4" />
                  CikitoAI
                </a>
                <CopyButton text={bookmarklet} label="Salin kode bookmarklet" />
              </div>

              <ol className="mt-5 space-y-2 text-sm text-ink-600 dark:text-ink-400">
                <li>
                  <strong>1.</strong> Tampilkan bilah bookmark (Ctrl/Cmd + Shift + B).
                </li>
                <li>
                  <strong>2.</strong> Seret tombol di atas ke bilah tersebut.
                </li>
                <li>
                  <strong>3.</strong> Buka website mana pun lalu klik bookmark “CikitoAI”.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
              <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                Catatan jujur soal keterbatasan
              </h4>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                <li>
                  • Sebagian situs (GitHub, bank, dsb.) memasang <em>Content Security Policy</em>{' '}
                  ketat yang memblokir skrip dari domain lain. Di situs seperti itu bookmarklet
                  tidak akan jalan — gunakan ekstensi peramban.
                </li>
                <li>• Halaman internal peramban (chrome://, about:) memang tidak bisa disuntik.</li>
                <li>
                  • Bookmarklet memuat berkas dari <code className="font-mono">{origin}</code>, jadi
                  server itu harus bisa diakses dari jaringanmu.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- popout */}
        {tab === 'popout' && (
          <div className="grid animate-fade-in items-center gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <PictureInPicture2 className="size-5 text-brand-500" />
                Keluar dari tab, tetap di atas layar
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Tekan ikon <strong>lepas jendela</strong> di header panel (atau tombol di samping)
                untuk memindahkan obrolan ke jendela mengambang sungguhan. Jendela ini tetap terlihat
                di atas aplikasi lain — editor kode, Word, atau tab lain — dan bisa dipindahkan ke
                mana saja di layar.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-600 dark:text-ink-400">
                <li>• Memakai Document Picture-in-Picture (Chrome/Edge 116+).</li>
                <li>• Peramban lain otomatis memakai jendela popup biasa.</li>
                <li>• Riwayat, API key, dan tema ikut berpindah — tanpa lewat server.</li>
              </ul>
              <button
                type="button"
                onClick={openPopout}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <PictureInPicture2 className="size-4" />
                Buka jendela mengambang sekarang
              </button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand-500/15 to-cyan-400/15 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-900">
                <div className="flex items-center gap-1.5 border-b border-black/[0.07] bg-black/[0.03] px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[0.7rem] font-semibold text-ink-500">
                    CikitoAI — jendela mengambang
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <div className="ml-auto w-3/5 rounded-2xl rounded-br-md bg-gradient-to-br from-brand-500 to-indigo-600 px-3 py-2 text-xs text-white">
                    Ringkas dokumen ini dong
                  </div>
                  <div className="w-4/5 rounded-2xl rounded-bl-md bg-black/[0.05] px-3 py-2 text-xs text-ink-600 dark:bg-white/10 dark:text-ink-200">
                    Tentu. Ada tiga poin utama…
                  </div>
                  <div className="w-2/5 rounded-2xl rounded-bl-md bg-black/[0.05] px-3 py-2 text-xs dark:bg-white/10">
                    <span className="inline-flex gap-1">
                      <span className="size-1.5 animate-bounce-dot rounded-full bg-brand-400" />
                      <span
                        className="size-1.5 animate-bounce-dot rounded-full bg-brand-400"
                        style={{ animationDelay: '120ms' }}
                      />
                      <span
                        className="size-1.5 animate-bounce-dot rounded-full bg-brand-400"
                        style={{ animationDelay: '240ms' }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- extension */}
        {tab === 'extension' && (
          <div className="grid animate-fade-in gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Blocks className="size-5 text-brand-500" />
                Ekstensi Chrome / Edge (Manifest V3)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Cara paling bebas hambatan: ekstensi menyuntikkan widget ke tab aktif dan mengirim
                permintaan lewat service worker-nya sendiri. Artinya <strong>tanpa backend</strong>,{' '}
                <strong>tanpa masalah CORS</strong>, dan tetap jalan di situs ber-CSP ketat.
              </p>
              <div className="mt-4">
                <Code>{`# siapkan folder ekstensi
npm run build:extension

# lalu di Chrome/Edge:
# 1. buka chrome://extensions
# 2. aktifkan "Mode pengembang"
# 3. "Muat yang belum dipaketkan" → pilih folder extension/`}</Code>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-wide text-ink-500 uppercase dark:text-ink-400">
                Isi paket
              </h4>
              <div className="mt-2">
                <Row k="manifest.json" v="Manifest V3, izin scripting + host untuk semua situs." />
                <Row
                  k="background.js"
                  v="Service worker: menyuntik widget & menjadi jembatan jaringan bebas CORS."
                />
                <Row k="boot.js" v="Menyiapkan opsi widget dan saklar buka/tutup dari ikon." />
                <Row k="widget.js" v="Bundel widget yang sama dengan mode tempel." />
              </div>
              <p className="mt-4 rounded-xl bg-emerald-500/[0.08] p-3 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
                Klik ikon ekstensi (atau <strong>Ctrl/Cmd + Shift + K</strong>) untuk membuka-tutup
                bubble di halaman yang sedang dibuka. API key disimpan di penyimpanan lokal
                peramban dan hanya dikirim ke penyedia yang kamu pilih.
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------- PWA */}
        {tab === 'app' && (
          <div className="grid animate-fade-in gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <MonitorDown className="size-5 text-brand-500" />
                Pasang sebagai aplikasi sendiri
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Jendela mengambang tetap milik tab yang membukanya: tutup tabnya, jendela itu ikut
                hilang. Kalau kamu ingin CikitoAI <strong>punya ikon dan jendela sendiri</strong>{' '}
                yang bertahan walau semua jendela peramban ditutup, pasang sebagai aplikasi.
              </p>

              <div className="mt-5">
                {app.installed ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                    <Check className="size-4" />
                    Sudah terpasang sebagai aplikasi
                  </span>
                ) : app.canInstall ? (
                  <button
                    type="button"
                    onClick={() => void app.install()}
                    disabled={app.busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    <MonitorDown className="size-4" />
                    Pasang CikitoAI di perangkat ini
                  </button>
                ) : (
                  <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3 text-sm text-ink-600 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
                    <strong className="block text-xs font-bold tracking-wide text-ink-500 uppercase dark:text-ink-400">
                      Pasang manual
                    </strong>
                    <span className="mt-1 block">
                      Chrome/Edge: ikon <em>Pasang</em> di ujung kanan address bar, atau menu ⋮ →
                      “Cast, simpan, dan bagikan” → <em>Instal halaman sebagai aplikasi</em>. Safari
                      iOS: Bagikan → <em>Tambahkan ke Layar Utama</em>.
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                Aplikasi terpasang membuka langsung layar chat, memakai riwayat dan API key yang
                sama, dan tetap bisa dibuka meski jaringan mati (jawaban AI tentu tetap butuh
                internet).
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-wide text-ink-500 uppercase dark:text-ink-400">
                Apa yang bertahan, apa yang tidak
              </h4>
              <div className="mt-2 overflow-hidden rounded-xl border border-black/[0.07] dark:border-white/[0.08]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/[0.04] text-[0.7rem] tracking-wide text-ink-500 uppercase dark:bg-white/5 dark:text-ink-400">
                    <tr>
                      <th className="px-3 py-2 font-bold">Situasi</th>
                      <th className="px-3 py-2 font-bold">Jendela mengambang</th>
                      <th className="px-3 py-2 font-bold">Aplikasi terpasang</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-600 dark:text-ink-300">
                    {[
                      ['Pindah ke aplikasi lain', 'Tetap tampil di atas', 'Tetap terbuka'],
                      ['Peramban diperkecil', 'Tetap tampil', 'Tetap terbuka'],
                      ['Tab asal ditutup', 'Ikut tertutup', 'Tetap terbuka'],
                      ['Semua jendela peramban ditutup', 'Ikut tertutup', 'Tetap terbuka'],
                      ['Peramban benar-benar dikeluarkan', 'Tertutup', 'Tertutup'],
                      ['Dibuka lagi nanti', 'Riwayat & API key kembali', 'Riwayat & API key kembali'],
                    ].map(([a, b, c]) => (
                      <tr key={a} className="border-t border-black/[0.06] dark:border-white/[0.07]">
                        <td className="px-3 py-2 font-semibold">{a}</td>
                        <td className="px-3 py-2">{b}</td>
                        <td className="px-3 py-2">{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 rounded-xl bg-amber-500/[0.08] p-3 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
                Jujur soal batasnya: aplikasi terpasang tetap memakai mesin peramban di perangkatmu
                dan tidak berjalan di latar belakang setelah ditutup. Untuk program desktop mandiri
                yang benar-benar lepas dari peramban, bundelnya perlu dibungkus Electron/Tauri.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
