# CikitoAI — Ekstensi Peramban (Manifest V3)

Menempelkan bubble CikitoAI ke **website mana pun** yang sedang kamu buka, tanpa backend dan tanpa
masalah CORS.

## Kenapa lewat ekstensi?

| Cara            | Butuh backend?          | Jalan di situs ber-CSP ketat? | Bebas CORS? |
| --------------- | ----------------------- | ----------------------------- | ----------- |
| `<script>`      | Opsional (mode `auto`)  | ❌ (diblokir CSP)             | Tergantung  |
| Bookmarklet     | Opsional                | ❌ (diblokir CSP)             | Tergantung  |
| **Ekstensi**    | **Tidak**               | **✅**                        | **✅**      |

Content script MV3 tetap tunduk pada CORS, jadi semua permintaan jaringan dialirkan lewat
service worker ekstensi (`background.js`) yang punya `host_permissions: <all_urls>`.

## Menyiapkan & memasang

```bash
npm install
npm run build:extension    # membangun widget + menyalinnya ke folder ini + membuat ikon
```

Lalu di Chrome atau Edge:

1. Buka `chrome://extensions` (atau `edge://extensions`).
2. Aktifkan **Mode pengembang**.
3. Klik **Muat yang belum dipaketkan** lalu pilih folder `extension/`.

Klik ikon CikitoAI di toolbar (atau tekan <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> /
<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>) untuk membuka–menutup widget di tab aktif.

## Isi folder

| Berkas          | Status    | Keterangan                                                            |
| --------------- | --------- | --------------------------------------------------------------------- |
| `manifest.json` | di-commit | Manifest V3: `scripting`, `activeTab`, `storage`, host `<all_urls>`.   |
| `background.js` | di-commit | Service worker: menyuntik widget + jembatan jaringan (SSE → port).     |
| `boot.js`       | di-commit | Menyiapkan opsi widget & saklar buka/tutup dari ikon ekstensi.         |
| `widget.js`     | dibuat    | Salinan `public/embed/cikito-widget.js`.                               |
| `ai-core.mjs`   | dibuat    | Salinan `shared/ai-core.mjs` (penerjemah penyedia).                    |
| `icons/*.png`   | dibuat    | Digambar oleh `scripts/build-extension.mjs`, tanpa dependensi.         |

Berkas “dibuat” tidak ikut di-commit — jalankan `npm run build:extension` setelah clone.

## Cara kerjanya

```
klik ikon ─▶ background.js
              ├─ chrome.tabs.sendMessage({type:'cikito-toggle'})   ← bila sudah tersuntik
              └─ chrome.scripting.executeScript(['boot.js','widget.js'], world:'ISOLATED')
                                    │
                                    ▼
                      boot.js menyetel CIKITO_EMBED_OPTIONS
                      { transport:'extension', theme:'auto', open:true }
                                    │
                                    ▼
                widget.js merender bubble + panel di dalam Shadow DOM
                                    │
                  chrome.runtime.connect({name:'cikito-chat'})
                                    │
                                    ▼
                background.js  fetch(penyedia)  →  event {type:'delta'|…}
```

## Privasi

- API key disimpan di `localStorage` halaman (prefix `cikito.ext.`) dan hanya dikirim ke penyedia
  yang kamu pilih.
- Ekstensi tidak mengirim apa pun ke server CikitoAI; tidak ada telemetri.
- Isi halaman yang kamu buka **tidak** dibaca atau dikirim ke mana pun.
