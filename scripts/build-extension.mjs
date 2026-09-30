/**
 * Menyiapkan folder `extension/` agar siap dimuat sebagai ekstensi Chrome/Edge:
 *
 *  1. menyalin bundel widget hasil `npm run build:embed` → extension/widget.js
 *  2. menyalin inti penerjemah penyedia            → extension/ai-core.mjs
 *  3. membuat ikon PNG (tanpa dependensi, digambar langsung)
 *
 * Semua berkas hasil salinan/gambar tidak ikut di-commit (lihat .gitignore).
 */
import { createRequire } from 'node:module'
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ext = resolve(root, 'extension')

/* ------------------------------------------------------------------ salin */

const widget = resolve(root, 'public/embed/cikito-widget.js')
if (!existsSync(widget)) {
  console.error('✖ public/embed/cikito-widget.js belum ada. Jalankan: npm run build:embed')
  process.exit(1)
}
cpSync(widget, resolve(ext, 'widget.js'))
cpSync(resolve(root, 'shared/ai-core.mjs'), resolve(ext, 'ai-core.mjs'))

/* ------------------------------------------------------------- ikon PNG */

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  let o = 0
  for (let y = 0; y < size; y++) {
    raw[o++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y, size)
      raw[o++] = r
      raw[o++] = g
      raw[o++] = b
      raw[o++] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const BRAND = [124, 77, 255]
const CYAN = [34, 211, 238]

/** Kotak membulat dengan gradien diagonal + gelembung chat putih. */
function icon(x, y, size) {
  const s = size
  const r = s * 0.24 // radius sudut
  const cx = Math.min(Math.max(x + 0.5, r), s - r)
  const cy = Math.min(Math.max(y + 0.5, r), s - r)
  const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
  const alpha = dist <= r ? 255 : dist <= r + 1 ? Math.round(255 * (r + 1 - dist)) : 0
  if (!alpha) return [0, 0, 0, 0]

  const [br, bg, bb] = mix(BRAND, CYAN, (x / s) * 0.45 + (y / s) * 0.55)

  // Gelembung chat: lingkaran putih + "ekor" kecil di kiri bawah.
  const bx = s * 0.5
  const by = s * 0.46
  const br2 = s * 0.26
  const inBubble = Math.hypot(x + 0.5 - bx, y + 0.5 - by) <= br2
  const inTail = Math.hypot(x + 0.5 - (bx - br2 * 0.72), y + 0.5 - (by + br2 * 0.86)) <= br2 * 0.34
  if (inBubble || inTail) return [255, 255, 255, alpha]

  return [br, bg, bb, alpha]
}

mkdirSync(resolve(ext, 'icons'), { recursive: true })
for (const size of [16, 48, 128]) {
  writeFileSync(resolve(ext, `icons/icon-${size}.png`), png(size, icon))
}

const kb = (p) => (require('node:fs').statSync(p).size / 1024).toFixed(1) + ' kB'
console.log(`✔ extension/widget.js   (${kb(resolve(ext, 'widget.js'))})`)
console.log(`✔ extension/ai-core.mjs (${kb(resolve(ext, 'ai-core.mjs'))})`)
console.log('✔ extension/icons/icon-{16,48,128}.png')
console.log('\nMuat di Chrome: chrome://extensions → Mode pengembang → Muat yang belum dipaketkan → pilih folder extension/')
