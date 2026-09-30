/**
 * Membuat ikon PWA di public/icons/ (digambar langsung, tanpa dependensi).
 * Dipanggil otomatis lewat hook predev/prebuild.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cikitoIcon, png } from './lib/icon.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'public/icons')
mkdirSync(out, { recursive: true })

const normal = cikitoIcon()
const maskable = cikitoIcon({ maskable: true })

const files = [
  ['icon-192.png', 192, normal],
  ['icon-512.png', 512, normal],
  ['icon-maskable-512.png', 512, maskable],
  ['apple-touch-icon.png', 180, maskable],
]

for (const [name, size, painter] of files) {
  writeFileSync(resolve(out, name), png(size, painter))
}
console.log(`✔ public/icons/ — ${files.map(([n]) => n).join(', ')}`)
