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
        'btn btn-sm border',
        done
          ? 'border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-brand-300'
          : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-950 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300 dark:hover:text-white',
      )}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Tersalin' : label}
    </button>
  )
}

function Code({ children, copy }: { children: string; copy?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-ink-950 dark:border-ink-800">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[0.68rem] tracking-wide text-ink-400 uppercase">
          <TerminalSquare className="size-3.5" /> Salin–tempel
        </span>
        <CopyButton text={copy ?? children} />
      </div>
      <pre className="thin-scrollbar overflow-x-auto p-4 text-[0.78rem] leading-relaxed text-ink-200">
        <code>{children}</code>
      </pre>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-ink-200 py-2.5 last:border-0 sm:flex-row sm:gap-4 dark:border-ink-800">
      <code className="shrink-0 font-mono text-[0.75rem] text-brand-700 sm:w-44 dark:text-brand-400">
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
        pip.document.body.style.cssText = 'margin:0;background:#09090b;overflow:hidden'
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
    <section id="bawa-ke-mana-saja" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {/* Tab */}
      <div className="mask-fade-x -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 rounded-xl border border-ink-200 bg-ink-50 p-1 dark:border-ink-800 dark:bg-ink-900/50">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm whitespace-nowrap transition-all duration-200',
                tab === t.id
                  ? 'bg-white font-medium text-ink-950 shadow-soft dark:bg-ink-950 dark:text-white'
                  : 'text-ink-500 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white',
              )}
              aria-pressed={tab === t.id}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card mt-6 p-6 sm:p-8">
        {/* ------------------------------------------------------- script */}
        {tab === 'script' && (
          <div className="grid animate-fade-in gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-ink-950 dark:text-white">
                <Globe className="size-4.5 text-brand-600 dark:text-brand-400" />
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
                  className="btn btn-primary btn-md"
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
              <h4 className="eyebrow">
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
              <p className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-3.5 text-xs leading-relaxed text-ink-600 dark:border-ink-800 dark:bg-ink-900/50 dark:text-ink-400">
                Kontrol lewat JavaScript juga bisa:{' '}
                <code className="font-mono text-brand-700 dark:text-brand-400">
                  CikitoAI.open()
                </code>
                ,{' '}
                <code className="font-mono text-brand-700 dark:text-brand-400">
                  CikitoAI.close()
                </code>
                ,{' '}
                <code className="font-mono text-brand-700 dark:text-brand-400">
                  CikitoAI.toggle()
                </code>
                ,{' '}
                <code className="font-mono text-brand-700 dark:text-brand-400">
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
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-ink-950 dark:text-white">
                <Bookmark className="size-4.5 text-brand-600 dark:text-brand-400" />
                Panggil di website orang lain
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Seret tombol di bawah ini ke bilah bookmark peramban. Klik bookmark itu saat
                membuka website apa pun — bubble CikitoAI langsung muncul di sana, tanpa perlu
                mengubah website tersebut.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  ref={bookmarkRef}
                  onClick={(e) => e.preventDefault()}
                  draggable
                  title="Seret saya ke bilah bookmark"
                  className="btn btn-primary btn-md cursor-grab active:cursor-grabbing"
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

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
              <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Catatan jujur soal keterbatasan
              </h4>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
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
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-ink-950 dark:text-white">
                <PictureInPicture2 className="size-4.5 text-brand-600 dark:text-brand-400" />
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
                className="btn btn-primary btn-md mt-5"
              >
                <PictureInPicture2 className="size-4" />
                Buka jendela mengambang sekarang
              </button>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-950">
                <div className="flex items-center gap-1.5 border-b border-ink-200 bg-ink-50 px-3 py-2.5 dark:border-ink-800 dark:bg-ink-900/50">
                  <span className="size-2.5 rounded-full bg-ink-200 dark:bg-ink-800" />
                  <span className="size-2.5 rounded-full bg-ink-200 dark:bg-ink-800" />
                  <span className="size-2.5 rounded-full bg-ink-200 dark:bg-ink-800" />
                  <span className="ml-2 text-[0.7rem] text-ink-500">
                    CikitoAI — jendela mengambang
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <div className="ml-auto w-3/5 rounded-xl rounded-br-sm bg-ink-950 px-3 py-2 text-xs text-white dark:bg-white dark:text-ink-950">
                    Ringkas dokumen ini dong
                  </div>
                  <div className="w-4/5 rounded-xl rounded-bl-sm border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-600 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
                    Tentu. Ada tiga poin utama…
                  </div>
                  <div className="w-2/5 rounded-xl rounded-bl-sm border border-ink-200 bg-ink-50 px-3 py-2 text-xs dark:border-ink-800 dark:bg-ink-900/60">
                    <span className="inline-flex gap-1">
                      <span className="size-1.5 animate-bounce-dot rounded-full bg-brand-500" />
                      <span
                        className="size-1.5 animate-bounce-dot rounded-full bg-brand-500"
                        style={{ animationDelay: '120ms' }}
                      />
                      <span
                        className="size-1.5 animate-bounce-dot rounded-full bg-brand-500"
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
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-ink-950 dark:text-white">
                <Blocks className="size-4.5 text-brand-600 dark:text-brand-400" />
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
              <h4 className="eyebrow">
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
              <p className="mt-5 rounded-lg border border-brand-500/20 bg-brand-500/[0.06] p-3.5 text-xs leading-relaxed text-ink-600 dark:text-ink-400">
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
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-ink-950 dark:text-white">
                <MonitorDown className="size-4.5 text-brand-600 dark:text-brand-400" />
                Pasang sebagai aplikasi sendiri
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                Jendela mengambang tetap milik tab yang membukanya: tutup tabnya, jendela itu ikut
                hilang. Kalau kamu ingin CikitoAI <strong>punya ikon dan jendela sendiri</strong>{' '}
                yang bertahan walau semua jendela peramban ditutup, pasang sebagai aplikasi.
              </p>

              <div className="mt-5">
                {app.installed ? (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 px-4 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-300">
                    <Check className="size-4" />
                    Sudah terpasang sebagai aplikasi
                  </span>
                ) : app.canInstall ? (
                  <button
                    type="button"
                    onClick={() => void app.install()}
                    disabled={app.busy}
                    className="btn btn-primary btn-md"
                  >
                    <MonitorDown className="size-4" />
                    Pasang CikitoAI di perangkat ini
                  </button>
                ) : (
                  <div className="rounded-lg border border-ink-200 bg-ink-50 p-4 text-sm text-ink-600 dark:border-ink-800 dark:bg-ink-900/50 dark:text-ink-400">
                    <strong className="eyebrow">
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
              <h4 className="eyebrow">
                Apa yang bertahan, apa yang tidak
              </h4>
              <div className="mt-3 overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink-50 text-[0.7rem] tracking-wide text-ink-500 uppercase dark:bg-ink-900/60 dark:text-ink-400">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Situasi</th>
                      <th className="px-3 py-2.5 font-medium">Jendela mengambang</th>
                      <th className="px-3 py-2.5 font-medium">Aplikasi terpasang</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-600 dark:text-ink-400">
                    {[
                      ['Pindah ke aplikasi lain', 'Tetap tampil di atas', 'Tetap terbuka'],
                      ['Peramban diperkecil', 'Tetap tampil', 'Tetap terbuka'],
                      ['Tab asal ditutup', 'Ikut tertutup', 'Tetap terbuka'],
                      ['Semua jendela peramban ditutup', 'Ikut tertutup', 'Tetap terbuka'],
                      ['Peramban benar-benar dikeluarkan', 'Tertutup', 'Tertutup'],
                      ['Dibuka lagi nanti', 'Riwayat & API key kembali', 'Riwayat & API key kembali'],
                    ].map(([a, b, c]) => (
                      <tr key={a} className="border-t border-ink-200 dark:border-ink-800">
                        <td className="px-3 py-2.5 font-medium text-ink-950 dark:text-white">{a}</td>
                        <td className="px-3 py-2.5">{b}</td>
                        <td className="px-3 py-2.5">{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3.5 text-xs leading-relaxed text-ink-600 dark:text-ink-400">
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
