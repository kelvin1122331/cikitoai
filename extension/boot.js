/**
 * Disuntikkan tepat sebelum widget.js, di dunia terisolasi (ISOLATED world)
 * milik ekstensi. Tugasnya menyiapkan opsi widget dan menyediakan saklar
 * buka/tutup untuk ikon ekstensi.
 */
globalThis.CIKITO_EMBED_OPTIONS = {
  // Semua permintaan jaringan lewat service worker ekstensi → bebas CORS,
  // tanpa perlu backend sama sekali.
  transport: 'extension',
  theme: 'auto',
  open: true,
  hotkey: false,
  // Simpan konfigurasi per-situs agar tidak tercampur dengan storage halaman.
  storagePrefix: 'cikito.ext.',
}

if (!globalThis.__cikitoExtensionBooted) {
  globalThis.__cikitoExtensionBooted = true

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type !== 'cikito-toggle') return
    const api = globalThis.CikitoAI
    if (!api?.mounted) {
      api?.init?.()
      sendResponse({ ok: true, stage: 'panel' })
      return
    }
    api.toggle()
    sendResponse({ ok: true, stage: api.stage })
  })
}
