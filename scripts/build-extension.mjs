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
import { cikitoIcon, png } from './lib/icon.mjs'

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

mkdirSync(resolve(ext, 'icons'), { recursive: true })
const painter = cikitoIcon()
for (const size of [16, 48, 128]) {
  writeFileSync(resolve(ext, `icons/icon-${size}.png`), png(size, painter))
}

const kb = (p) => (require('node:fs').statSync(p).size / 1024).toFixed(1) + ' kB'
console.log(`✔ extension/widget.js   (${kb(resolve(ext, 'widget.js'))})`)
console.log(`✔ extension/ai-core.mjs (${kb(resolve(ext, 'ai-core.mjs'))})`)
console.log('✔ extension/icons/icon-{16,48,128}.png')
console.log('\nMuat di Chrome: chrome://extensions → Mode pengembang → Muat yang belum dipaketkan → pilih folder extension/')
