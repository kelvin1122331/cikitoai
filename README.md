# CikitoAI

Website **clean UI & responsif** dengan satu tombol **Jalankan**. Tekan tombolnya, lalu muncul
**bubble bulat kecil yang bisa digeser** ke mana saja. Klik bubble-nya → terbuka **form API AI**
(bisa diisi **model AI apa pun**). Tekan **Jalankan** sekali lagi → berubah menjadi **UI chat AI**
lengkap yang siap menjawab apa saja.

Panelnya bisa **diubah ukurannya**, **dibuka–tutup**, dan **menyesuaikan diri** dari layar 320px
sampai ultrawide.

```
Tombol "Jalankan"  →  Bubble (digeser)  →  Form API  →  Tombol "Jalankan"  →  Chat AI
```

Dan bubble-nya **tidak terkurung di website ini**: tempel di situs lain dengan satu baris
`<script>`, panggil lewat bookmarklet, lepas jadi **jendela mengambang** di atas aplikasi lain,
pasang sebagai **ekstensi peramban**, atau **pasang sebagai aplikasi** dengan ikon dan jendela
sendiri. Lihat [Bawa ke mana saja](#-bawa-ke-mana-saja).

---

## ✨ Fitur

| Kategori | Detail |
| --- | --- |
| **Bubble mengambang** | Digeser dengan mouse/jari (Pointer Events), otomatis menempel ke tepi terdekat, posisi diingat |
| **Ubah ukuran** | 8 pegangan (4 sisi + 4 sudut), preset Kecil/Sedang/Besar, mode layar penuh, skala teks 80–150% |
| **Buka–tutup** | Klik bubble, tombol minimize, tombol tutup, tarik ke bawah (mobile), `Esc`, `Ctrl/⌘ + K` |
| **Model AI apa pun** | 13 preset penyedia + endpoint kustom; kolom nama model **bebas diisi** |
| **Streaming** | Jawaban mengalir token demi token lewat SSE, bisa dihentikan, tampil "proses berpikir" bila ada |
| **Markdown** | Judul, daftar, tabel, kutipan, tautan, blok kode dengan tombol salin (renderer sendiri, aman XSS) |
| **Responsif** | Panel mengambang di desktop, bottom sheet di ponsel, target sentuh lega |
| **Privasi** | API key hanya di `localStorage`; backend hanya me-relay, tidak menyimpan & tidak mencatat log |
| **Bisa dibawa keluar** | Bundel tempel (Shadow DOM), bookmarklet, jendela mengambang (Document PiP), ekstensi MV3, PWA |
| **Lainnya** | Tema gelap/terang, mode demo tanpa API key, tes koneksi, muat daftar model, riwayat chat tersimpan |

## 🔌 Penyedia yang didukung

OpenAI · Anthropic Claude · Google Gemini · Groq · OpenRouter · DeepSeek · Mistral · xAI Grok ·
Together AI · Ollama (lokal) · LM Studio (lokal) · **Kustom** (Base URL apa pun) · **Mode Demo**
(tanpa API key).

Backend menormalisasi tiga bentuk API sehingga hampir semua layanan bisa dipakai:

- `openai` → `POST {baseUrl}/chat/completions` (standar de-facto)
- `anthropic` → `POST {baseUrl}/v1/messages`
- `gemini` → `POST {baseUrl}/v1beta/models/{model}:streamGenerateContent`

Model baru yang rilis besok pun langsung bisa dipakai — cukup ketik namanya.

## 🚀 Menjalankan

```bash
npm install
npm run dev          # http://localhost:5173
```

Produksi:

```bash
npm run build        # hasil ke dist/
npm start            # server Node tanpa dependensi (statis + /api), PORT=3000
```

Perintah lain:

```bash
npm run smoke            # smoke test end-to-end di jsdom (60 pemeriksaan, tanpa jaringan)
npm run build:embed      # bundel tempel  → public/embed/cikito-widget.js
npm run build:icons      # ikon PWA       → public/icons/*.png (digambar tanpa dependensi)
npm run build:extension  # paket ekstensi → extension/ (widget.js, ai-core.mjs, ikon)
```

> `npm run dev` dan `npm run build` otomatis membangun ikon + bundel tempel lebih dulu.

## 🌍 Bawa ke mana saja

Empat cara memakai widget yang sama di luar halaman ini. Semuanya memakai satu bundel:
`public/embed/cikito-widget.js` (±108 kB gzip, sudah termasuk React dan CSS-nya).

### 1. Tempel di website mana pun

```html
<script
  src="https://domain-kamu.com/embed/cikito-widget.js"
  data-api-base="https://domain-kamu.com"
  data-transport="auto"
  data-theme="auto"
  defer
></script>
```

Widget dirender di dalam **Shadow DOM**, jadi CSS situs tuan rumah tidak bocor masuk dan CSS widget
tidak bocor keluar. Contoh situs tuan rumah tersedia di `/demo-tempel.html` (halaman serif biasa
tanpa Tailwind, dengan aturan CSS agresif — widget tetap utuh).

| Atribut | Arti |
| --- | --- |
| `data-api-base` | Asal backend CikitoAI. Default: asal berkas skrip. |
| `data-transport` | `auto` (bawaan) · `proxy` (lewat backend) · `direct` (browser → penyedia). |
| `data-theme` | `auto` (bawaan) · `light` · `dark`. |
| `data-open` | `true` → langsung buka panel, bukan bubble. |
| `data-hotkey` | `true` → aktifkan `Ctrl/⌘ + K` (mati secara bawaan agar tidak bentrok). |
| `data-provider`, `data-model`, `data-api-key`, `data-system` | Isian awal (tetap bisa diubah pengguna). |
| `data-skip-setup` | `true` → langsung ke chat bila konfigurasi awal sudah lengkap. |
| `data-z-index` | Ubah tumpukan (bawaan `2147483000`). |
| `data-storage-prefix` | Awalan kunci `localStorage`. |
| `data-auto="false"` | Jangan pasang otomatis; panggil `CikitoAI.init({...})` sendiri. |

API global: `CikitoAI.init(opts)`, `.open()`, `.close()`, `.toggle()`, `.hide()`, `.show()`,
`.destroy()`, `.stage`, `.mounted`.

### 2. Bookmarklet

Di bagian **Bawa ke mana saja** pada halaman utama tersedia tombol yang bisa diseret ke bilah
bookmark. Klik bookmark itu di website mana pun → bubble muncul di sana.
Catatan jujur: situs dengan *Content Security Policy* ketat (GitHub, perbankan) akan memblokirnya —
untuk kasus itu pakai ekstensi.

### 3. Jendela mengambang (pop-out)

Ikon **lepas jendela** di header panel memindahkan obrolan ke jendela mengambang sungguhan lewat
[Document Picture-in-Picture](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
(Chrome/Edge 116+), sehingga tetap terlihat di atas aplikasi lain. Peramban lain otomatis memakai
jendela popup biasa. Halaman yang dimuat adalah `/?cikito=popout`, dan konfigurasi dititipkan lewat
**hash URL** (tidak pernah dikirim ke server) lalu langsung dihapus dari address bar.

### 4. Ekstensi peramban (Manifest V3)

```bash
npm run build:extension
# chrome://extensions → Mode pengembang → Muat yang belum dipaketkan → pilih folder extension/
```

Cara paling bebas hambatan: **tanpa backend**, **tanpa CORS**, tetap jalan di situs ber-CSP ketat,
karena permintaan jaringan dijembatani service worker ekstensi. Detail: [`extension/README.md`](extension/README.md).

### 5. Pasang sebagai aplikasi (PWA)

Tekan tombol **Pasang** di tab *Aplikasi desktop*, atau ikon **Pasang** di address bar
Chrome/Edge. CikitoAI lalu punya **ikon dan jendela sendiri** di taskbar/dock, membuka langsung
layar chat (`start_url: /?cikito=popout`), dan cangkang UI-nya tetap terbuka walau jaringan mati
(`public/sw.js`; `/api/*` tidak pernah di-cache).

#### Apa yang bertahan saat kamu meninggalkan peramban

| Situasi | Jendela mengambang (PiP) | Aplikasi terpasang (PWA) |
| --- | --- | --- |
| Pindah ke aplikasi lain | Tetap tampil **di atas** aplikasi lain | Tetap terbuka |
| Jendela peramban diperkecil | Tetap tampil | Tetap terbuka |
| Tab asal ditutup | **Ikut tertutup** | Tetap terbuka |
| Semua jendela peramban ditutup | **Ikut tertutup** | Tetap terbuka |
| Peramban benar-benar dikeluarkan | Tertutup | Tertutup |
| Dibuka lagi nanti | Riwayat, API key, posisi & ukuran kembali | Sama |

Semua state (riwayat chat, API key, posisi bubble, ukuran panel, skala teks, tema) ada di
`localStorage`, jadi **tidak pernah hilang** hanya karena jendelanya ditutup.

Batasnya, jujur: PWA tetap memakai mesin peramban di perangkatmu dan tidak berjalan di latar
belakang setelah ditutup. Untuk program desktop yang benar-benar lepas dari peramban, bundelnya
perlu dibungkus Electron/Tauri.

### Jalur pengiriman permintaan

| Mode | Alur | Kapan dipakai |
| --- | --- | --- |
| `proxy` | browser → `/api/chat` → penyedia | Bawaan situs ini. Paling kompatibel. |
| `direct` | browser → penyedia | Tanpa backend (hosting statis). Tergantung CORS penyedia. |
| `auto` | coba `proxy`, jatuh ke `direct` bila backend tak terjangkau | Bawaan bundel tempel. |
| `extension` | halaman → service worker ekstensi → penyedia | Dipakai ekstensi. Bebas CORS. |

Logika penerjemah penyedia dipakai bersama oleh ketiganya lewat `shared/ai-core.mjs`.

## 🗺️ Halaman

Setiap menu adalah **halaman tersendiri** dengan URL sendiri — bukan gulir di satu halaman
panjang. Routing memakai History API lewat router mungil buatan sendiri (`src/lib/router.tsx`,
tanpa dependensi): bisa di-bookmark, dibuka di tab baru dengan Ctrl/⌘ + klik, dan tombol
Back/Forward peramban tetap bekerja.

| URL | Halaman | Isi |
| --- | --- | --- |
| `/` | Beranda | Hero, tombol Jalankan, kartu menuju setiap halaman |
| `/fitur` | Fitur | Enam fitur inti + bagian responsif |
| `/cara-kerja` | Cara kerja | Tiga langkah + catatan (model bebas, mode demo, tes koneksi) |
| `/penyedia` | Penyedia | Katalog 13 penyedia + tiga bentuk API yang dinormalisasi |
| `/bawa-ke-mana-saja` | Bawa ke mana saja | Skrip tempel, bookmarklet, pop-out, ekstensi, PWA |
| `/faq` | FAQ | Tanya jawab |
| `/?cikito=popout` | Jendela mengambang | Hanya UI chat, untuk Document PiP / popup / PWA |
| lainnya | 404 | Halaman tidak ditemukan + jalan pintas ke menu lain |

Widget sengaja dirender **di luar** halaman, jadi obrolan yang sedang berjalan tidak terputus
ketika kamu berpindah menu.

## ⌨️ Pintasan

| Tombol | Fungsi |
| --- | --- |
| `Ctrl` / `⌘` + `K` | Buka–tutup panel |
| `Esc` | Kecilkan panel ke bubble |
| `Enter` | Kirim pesan |
| `Shift` + `Enter` | Baris baru |
| Klik ganda header | Layar penuh / kembalikan |

## 🧱 Struktur

```
shared/
  ai-core.mjs        inti penerjemah penyedia — dipakai backend, browser, & ekstensi
server/
  api.mjs            middleware /api (chat SSE, daftar model, health) — tanpa dependensi
  index.mjs          server produksi: statis dist/ + API yang sama
extension/           ekstensi Chrome/Edge MV3 (lihat extension/README.md)
src/
  embed/             bundel tempel: mount Shadow DOM + API global CikitoAI
  PopoutApp.tsx      halaman jendela mengambang (/?cikito=popout)
  site/
    Shell.tsx        kerangka situs: latar, navbar (menu = halaman), footer
    routes.ts        daftar rute: path, label, judul tab, deskripsi, ikon
    parts.tsx        PageHero, Pager, CtaBanner, SectionHeading, mockup
  pages/
    Beranda.tsx      hero + kartu menu ke setiap halaman
    Fitur.tsx        daftar fitur + bagian responsif
    CaraKerja.tsx    tiga langkah + catatan tambahan
    Penyedia.tsx     katalog 13 penyedia + tiga bentuk API
    BawaKeMana.tsx   halaman distribusi (memakai Distribusi.tsx)
    Faq.tsx          tanya jawab
    NotFound.tsx     halaman 404
  components/
    Distribusi.tsx   isi "Bawa ke mana saja" (skrip, bookmarklet, pop-out, ekstensi, PWA)
    Markdown.tsx     renderer Markdown → React (tanpa dangerouslySetInnerHTML)
    ui.tsx           primitif UI kecil
    widget/
      Widget.tsx     orkestrator: tahap hidden → bubble → panel, posisi & persistensi
      Bubble.tsx     bubble bulat: drag, snap ke tepi, petunjuk
      Panel.tsx      bingkai panel: drag header, 8 pegangan resize, preset, skala, layar penuh
      SetupView.tsx  form API: penyedia, Base URL, key, model bebas, opsi lanjutan, tes koneksi
      ChatView.tsx   ruang chat: streaming, saran, komposer, gulir pintar
      MessageItem.tsx balon pesan: markdown, salin, buat ulang, hapus
  hooks/             usePointerDrag, useChat, useMediaQuery/useViewport, useInstallApp
  lib/               router (mini, History API), providers, runtime, stream/direct/extension, storage, utils
public/
  demo-tempel.html   contoh "website orang lain" yang menempelkan widget
  manifest.webmanifest  metadata PWA (nama, ikon, start_url, standalone)
  sw.js              service worker: installability + cangkang offline
  embed/, icons/     hasil build (tidak di-commit)
scripts/
  smoke-test.mjs     uji alur pengguna end-to-end di jsdom (60 pemeriksaan)
  build-extension.mjs menyiapkan folder extension/
  make-icons.mjs     menggambar ikon PWA; encoder PNG ada di scripts/lib/icon.mjs
```

## 🔒 Catatan keamanan

- API key disimpan di `localStorage` browser dan **hanya** dikirim ke backend saat ada permintaan,
  lalu diteruskan langsung ke penyedia. Tidak ditulis ke disk, tidak masuk log.
- Backend dibutuhkan karena sebagian besar penyedia AI memblokir panggilan langsung dari browser
  (CORS). Kalau di-deploy publik, tambahkan autentikasi/rate limit sendiri di depan `/api`.
- Mode `direct` dan ekstensi tidak melewati backend sama sekali: API key dikirim langsung dari
  perangkat kamu ke penyedia.
- `data-api-key` pada tag `<script>` akan terlihat di HTML halaman — pakai hanya untuk demo
  internal, bukan situs publik.
- Renderer Markdown membangun elemen React (bukan `innerHTML`) dan menyaring skema URL berbahaya.

---

Dibuat dengan React 19, TypeScript, Vite 7, dan Tailwind CSS v4.
