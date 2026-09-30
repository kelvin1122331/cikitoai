/**
 * Smoke test CikitoAI — menjalankan aplikasi React sungguhan di dalam jsdom
 * lalu menelusuri alur pengguna dari ujung ke ujung:
 *
 *   Jalankan → bubble → geser → buka panel → isi API → Jalankan → chat →
 *   streaming + Markdown → resize → preset → layar penuh → minimize → Esc → tutup
 *
 * Jaringan di-stub (SSE palsu) supaya hermetis dan tidak butuh API key.
 * Jalankan dengan:  npm run smoke
 */
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html class="dark"><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
})
const { window } = dom

// --- globals agar React DOM bisa jalan di Node ---
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Element = window.Element
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.KeyboardEvent = window.KeyboardEvent
globalThis.localStorage = window.localStorage
globalThis.location = window.location
globalThis.history = window.history
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
window.matchMedia = (q) => ({
  matches: /max-width:\s*767px/.test(q) ? window.innerWidth <= 767 : false,
  media: q,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
})
globalThis.matchMedia = window.matchMedia
const nodeFetch = globalThis.fetch
const FAKE = true
const fakeResponse = () => {
  const body = new ReadableStream({
    start(c) {
      const enc = new TextEncoder()
      const md = '# Judul\n\nHalo **dunia** dari `CikitoAI`.\n\n| Fitur | Status |\n| --- | --- |\n| Geser | OK |\n| Resize | OK |\n\n```js\nconsole.log(1)\n```\n\n- satu\n- dua\n\n> kutipan\n\nSelamat mencoba.'
      const toks = md.match(/[\s\S]{1,6}/g)
      let i = 0
      const id = setInterval(() => {
        if (i < toks.length) c.enqueue(enc.encode('data: ' + JSON.stringify({ type: 'delta', text: toks[i++] }) + '\n\n'))
        else { c.enqueue(enc.encode('data: {"type":"done"}\n\n')); clearInterval(id); c.close() }
      }, 15)
    },
  })
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
}
const relFetch = (u, o) => (FAKE && String(u).includes('/api/chat')) ? Promise.resolve(fakeResponse()) : nodeFetch(typeof u === 'string' ? new URL(u, 'http://localhost:5173') : u, o)
window.fetch = relFetch
globalThis.fetch = relFetch
window.scrollTo = () => {}
window.HTMLElement.prototype.scrollTo = function () {}
window.HTMLElement.prototype.setPointerCapture = function () {}
window.HTMLElement.prototype.releasePointerCapture = function () {}
globalThis.IS_REACT_ACT_ENVIRONMENT = false

const errors = []
const origError = console.error
console.error = (...args) => {
  errors.push(args.map(String).join(' '))
  origError(...args)
}
window.addEventListener('error', (e) => errors.push('window.error: ' + e.message))

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { default: App } = await vite.ssrLoadModule('/src/App.tsx')
const React = (await import('react')).default
// flush manual: React 19 auto-batch + scheduler jsdom
const act = async (fn) => { await fn(); await new Promise((r) => setTimeout(r, 40)) }
const { createRoot } = await import('react-dom/client')

const root = createRoot(document.getElementById('root'))
await act(async () => root.render(React.createElement(App)))

const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]
const byText = (sel, text) =>
  $$(sel).find((el) => (el.textContent || '').toLowerCase().includes(text.toLowerCase()))
const click = async (el) => {
  if (!el) throw new Error('elemen tidak ditemukan untuk diklik')
  await act(async () => {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}
const pointer = async (el, type, x, y) => {
  const ev = new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(ev, 'pointerId', { value: 1 })
  await act(async () => {
    ;(type === 'pointerdown' ? el : window).dispatchEvent(ev)
  })
}
const wait = (ms) => act(async () => new Promise((r) => setTimeout(r, ms)))

const results = []
const check = (name, cond, extra = '') => {
  results.push({ name, ok: !!cond, extra })
  console.log(`${cond ? '✅' : '❌'} ${name}${extra && !cond ? ' → ' + extra : ''}`)
}

/* 1 — landing tampil */
check('Landing ter-render', /CikitoAI/.test(document.body.textContent))
check('Ada tombol Jalankan', !!byText('button', 'Jalankan'))
check('Widget belum muncul', !$('[role="dialog"]') && !$('[aria-label^="Buka CikitoAI"]'))

/* 1b — bagian distribusi: cuplikan tempel & bookmarklet */
check('Ada bagian "Bawa ke mana saja"', !!$('#bawa-ke-mana-saja'))
check(
  'Cuplikan skrip tempel tampil',
  /embed\/cikito-widget\.js/.test($('#bawa-ke-mana-saja').textContent),
)
await click(byText('#bawa-ke-mana-saja button', 'Bookmarklet'))
const bm = $$('#bawa-ke-mana-saja a').find((a) => (a.getAttribute('href') || '').startsWith('javascript:'))
check(
  'Bookmarklet punya href javascript: yang bisa diseret',
  !!bm && bm.getAttribute('href').includes('/embed/cikito-widget.js'),
)
await click(byText('#bawa-ke-mana-saja button', 'Tempel di website'))

/* 2 — tekan Jalankan → bubble muncul */
await click(byText('button', 'Jalankan'))
const bubbleBtn = $('[aria-label^="Buka CikitoAI"]')
check('Bubble muncul setelah Jalankan', !!bubbleBtn)

/* 3 — geser bubble */
const holder = bubbleBtn?.parentElement
const before = holder?.style.left
await pointer(bubbleBtn, 'pointerdown', 1000, 700)
await pointer(bubbleBtn, 'pointermove', 400, 300)
await pointer(bubbleBtn, 'pointerup', 400, 300)
check('Bubble berpindah saat digeser', holder?.style.left !== before, `${before} → ${holder?.style.left}`)

/* 4 — klik bubble → panel setup */
await pointer($('[aria-label^="Buka CikitoAI"]'), 'pointerdown', 20, 300)
await pointer($('[aria-label^="Buka CikitoAI"]'), 'pointerup', 20, 300)
const dialog = $('[role="dialog"]')
check('Panel terbuka setelah klik bubble', !!dialog)
check('Form API tampil', /Pilih penyedia AI/.test(document.body.textContent))
check('Ada kolom API key', !!$('#cikito-key'))
check('Ada kolom model (bebas diisi)', !!$('#cikito-model'))

/* 5 — pilih Mode Demo lalu Jalankan */
await click(byText('button', 'Mode Demo'))
const runBtn = $$('button').filter((b) => b.textContent.trim() === 'Jalankan').pop()
await click(runBtn)
check('Berpindah ke UI chat', /Tanya apa saja/.test(document.body.textContent))

/* 6 — kirim pesan dan terima stream */
const ta = $('textarea')
await act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  setter.call(ta, 'halo cikito')
  ta.dispatchEvent(new window.Event('input', { bubbles: true }))
})
await click($('[aria-label="Kirim pesan"]'))
await new Promise((r) => setTimeout(r, 2500))
const bodyText = document.body.textContent
check('Pesan pengguna tampil', /halo cikito/.test(bodyText))
check('Jawaban AI (streaming) diterima', /Selamat mencoba/.test(bodyText))
check('Markdown tabel ter-render', !!$('[role="dialog"] table'))
check('Blok kode punya tombol salin', !!$('[aria-label="Salin kode"]'))
check('Tombol lepas ke jendela tersedia', !!$('[aria-label="Lepas ke jendela terpisah"]'))

/* 7 — ubah ukuran panel lewat pegangan */
const seHandle = $('[aria-label="Ubah ukuran dari sisi se"]')
const d = $('[role="dialog"]')
const wBefore = d.style.width
await pointer(seHandle, 'pointerdown', 500, 500)
await pointer(seHandle, 'pointermove', 660, 640)
await pointer(seHandle, 'pointerup', 660, 640)
check('Panel bisa diubah ukurannya', d.style.width !== wBefore, `${wBefore} → ${d.style.width}`)

/* 8 — menu ukuran & skala */
await click($('[aria-label="Atur ukuran tampilan"]'))
check('Menu ukuran terbuka', /Skala teks/.test(document.body.textContent))
await click(byText('button', 'Besar'))
await wait(50)
check('Preset ukuran diterapkan', $('[role="dialog"]').style.width === '560px', $('[role="dialog"]').style.width)

/* 9 — layar penuh */
await click($('[aria-label="Layar penuh"]'))
check('Mode layar penuh aktif', $('[role="dialog"]').style.inset === '16px', $('[role="dialog"]').style.inset)
await click($('[aria-label="Kembalikan ukuran"]'))
check('Kembali dari layar penuh', !!$('[role="dialog"]').style.width)

/* 10 — minimize & Esc */
await click($('[aria-label="Kecilkan ke bubble"]'))
check('Minimize kembali ke bubble', !$('[role="dialog"]') && !!$('[aria-label^="Buka CikitoAI"]'))
await pointer($('[aria-label^="Buka CikitoAI"]'), 'pointerdown', 20, 300)
await pointer($('[aria-label^="Buka CikitoAI"]'), 'pointerup', 20, 300)
check('Buka lagi langsung ke chat (sudah dijalankan)', /Tanya apa saja/.test(document.body.textContent))
await act(async () => {
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
})
check('Esc mengecilkan panel', !$('[role="dialog"]'))

/* 11 — tutup total */
await click($('[aria-label="Sembunyikan widget"]'))
check('Bubble bisa disembunyikan', !$('[aria-label^="Buka CikitoAI"]'))

/* 12 — bundel tempel: mount di Shadow DOM website lain */
const embed = await vite.ssrLoadModule('/src/embed/index.tsx')
await wait(60)
const hostEl = document.getElementById('cikito-widget-host')
check('Embed memasang host tersembunyi', !!hostEl && !!hostEl.shadowRoot)
const shadow = hostEl?.shadowRoot
check('Embed menyuntik CSS ke Shadow DOM', !!shadow?.querySelector('style')?.textContent?.includes('--color-brand-500'))
check('Bubble tampil di dalam Shadow DOM', !!shadow?.querySelector('[aria-label^="Buka CikitoAI"]'))
check('Bubble tempel tanpa tombol sembunyikan', !shadow?.querySelector('[aria-label="Sembunyikan widget"]'))
check('API global CikitoAI tersedia', typeof window.CikitoAI?.open === 'function')
await act(async () => window.CikitoAI.open())
const embeddedPanel = shadow?.querySelector('[role="dialog"]')
check('Panel tempel bisa dibuka lewat API', !!embeddedPanel)
check('Widget tempel tidak bocor ke halaman', !document.body.querySelector('[role="dialog"]'))
check(
  'Pop-out disembunyikan bila asal backend tak diketahui',
  !shadow?.querySelector('[aria-label="Lepas ke jendela terpisah"]'),
)
await act(async () => window.CikitoAI.destroy())
check('Embed bisa dilepas kembali', !document.getElementById('cikito-widget-host'))
check('Modul embed mengekspor API', typeof embed.default?.init === 'function')

/* 13 — halaman popout (jendela mengambang) */
const { encodePayload } = await vite.ssrLoadModule('/src/lib/utils.ts')
const handoff = encodePayload({
  config: JSON.parse(localStorage.getItem('cikito.config')),
  scale: 1.1,
  theme: 'dark',
  transport: 'proxy',
})
window.history.replaceState(null, '', `/?cikito=popout#cfg=${handoff}`)
const { default: PopoutApp } = await vite.ssrLoadModule('/src/PopoutApp.tsx')
const popHost = document.createElement('div')
document.body.appendChild(popHost)
const popRoot = createRoot(popHost)
await act(async () => popRoot.render(React.createElement(PopoutApp)))
check('Popout ter-render', /CikitoAI/.test(popHost.textContent))
check(
  'Popout langsung ke chat + riwayat ikut pindah',
  /halo cikito/.test(popHost.textContent) && /Enter kirim/.test(popHost.textContent),
)
check('Popout memakai skala teks titipan', popHost.firstElementChild?.style.fontSize === '15.4px')
check('Hash konfigurasi dibersihkan dari URL', !window.location.hash)
await act(async () => popRoot.unmount())
popHost.remove()
window.history.replaceState(null, '', '/')

/* 14 — persistensi */
check('Konfigurasi tersimpan', !!localStorage.getItem('cikito.config'))
check('Riwayat chat tersimpan', (localStorage.getItem('cikito.messages') || '').includes('halo cikito'))

const realErrors = errors.filter(
  (e) => !/not wrapped in act|Warning: ReactDOM.render|useLayoutEffect does nothing on the server/.test(e),
)
check('Tidak ada error konsol', realErrors.length === 0, realErrors.slice(0, 3).join(' | '))

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} lolos`)
await vite.close()
process.exit(failed.length ? 1 : 0)
