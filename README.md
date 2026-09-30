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
npm run smoke        # smoke test end-to-end di jsdom (26 pemeriksaan, tanpa jaringan)
```

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
server/
  api.mjs            middleware /api (chat SSE, daftar model, health) — tanpa dependensi
  index.mjs          server produksi: statis dist/ + API yang sama
src/
  components/
    Landing.tsx      halaman utama (hero, fitur, cara kerja, FAQ, footer)
    Markdown.tsx     renderer Markdown → React (tanpa dangerouslySetInnerHTML)
    ui.tsx           primitif UI kecil
    widget/
      Widget.tsx     orkestrator: tahap hidden → bubble → panel, posisi & persistensi
      Bubble.tsx     bubble bulat: drag, snap ke tepi, petunjuk
      Panel.tsx      bingkai panel: drag header, 8 pegangan resize, preset, skala, layar penuh
      SetupView.tsx  form API: penyedia, Base URL, key, model bebas, opsi lanjutan, tes koneksi
      ChatView.tsx   ruang chat: streaming, saran, komposer, gulir pintar
      MessageItem.tsx balon pesan: markdown, salin, buat ulang, hapus
  hooks/             usePointerDrag, useChat, useMediaQuery/useViewport
  lib/               providers (katalog), stream (SSE client), storage, utils
scripts/
  smoke-test.mjs     uji alur pengguna end-to-end di jsdom
```

## 🔒 Catatan keamanan

- API key disimpan di `localStorage` browser dan **hanya** dikirim ke backend saat ada permintaan,
  lalu diteruskan langsung ke penyedia. Tidak ditulis ke disk, tidak masuk log.
- Backend dibutuhkan karena sebagian besar penyedia AI memblokir panggilan langsung dari browser
  (CORS). Kalau di-deploy publik, tambahkan autentikasi/rate limit sendiri di depan `/api`.
- Renderer Markdown membangun elemen React (bukan `innerHTML`) dan menyaring skema URL berbahaya.

---

Dibuat dengan React 19, TypeScript, Vite 7, dan Tailwind CSS v4.
