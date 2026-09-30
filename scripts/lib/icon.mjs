/**
 * Penggambar ikon CikitoAI + encoder PNG minimal — tanpa dependensi.
 * Dipakai oleh scripts/make-icons.mjs (PWA) dan scripts/build-extension.mjs.
 */
import { deflateSync } from 'node:zlib'

/* ------------------------------------------------------------ encoder PNG */

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** Render fungsi pixel (x, y, size) → [r,g,b,a] menjadi buffer PNG RGBA. */
export function png(size, pixel) {
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
  ihdr[8] = 8 // kedalaman bit
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------------------------------------------------------------- gambar */

const BRAND = [124, 77, 255]
const CYAN = [34, 211, 238]
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

/**
 * Ikon CikitoAI: kotak membulat bergradien + gelembung chat putih.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.maskable] Full-bleed (tanpa sudut membulat) dan
 *   gelembung diperkecil agar aman di dalam "safe zone" ikon maskable.
 */
export function cikitoIcon({ maskable = false } = {}) {
  return function pixel(x, y, s) {
    const px = x + 0.5
    const py = y + 0.5
    let alpha = 255

    if (!maskable) {
      const r = s * 0.24
      const cx = Math.min(Math.max(px, r), s - r)
      const cy = Math.min(Math.max(py, r), s - r)
      const d = Math.hypot(px - cx, py - cy)
      alpha = d <= r ? 255 : d <= r + 1 ? Math.round(255 * (r + 1 - d)) : 0
      if (!alpha) return [0, 0, 0, 0]
    }

    const [br, bg, bb] = mix(BRAND, CYAN, (x / s) * 0.45 + (y / s) * 0.55)

    const scale = maskable ? 0.72 : 1
    const bx = s * 0.5
    const by = s * 0.46
    const rad = s * 0.26 * scale
    const inBubble = Math.hypot(px - bx, py - by) <= rad
    const inTail = Math.hypot(px - (bx - rad * 0.72), py - (by + rad * 0.86)) <= rad * 0.34
    if (inBubble || inTail) return [255, 255, 255, alpha]

    return [br, bg, bb, alpha]
  }
}
