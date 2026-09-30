import { useCallback, useEffect, useState } from 'react'
import type { WidgetStage } from './types'
import { KEYS, loadRaw, saveJSON } from './lib/storage'
import { setRuntime } from './lib/runtime'
import { usePathname, useScrollReset } from './lib/router'
import { Shell } from './site/Shell'
import { Beranda } from './pages/Beranda'
import { Fitur } from './pages/Fitur'
import { CaraKerja } from './pages/CaraKerja'
import { Penyedia } from './pages/Penyedia'
import { BawaKeMana } from './pages/BawaKeMana'
import { Faq } from './pages/Faq'
import { NotFound } from './pages/NotFound'
import { Widget } from './components/widget/Widget'
import PopoutApp from './PopoutApp'

/** Jendela mengambang memakai halaman yang sama dengan penanda ?cikito=popout. */
const isPopout =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).get('cikito') === 'popout'

export default function App() {
  if (isPopout) return <PopoutApp />
  return <MainApp />
}

function MainApp() {
  const [stage, setStage] = useState<WidgetStage>('hidden')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadRaw(KEYS.theme, 'dark'))
  const pathname = usePathname()
  useScrollReset(pathname)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    setRuntime({ theme })
    saveJSON(KEYS.theme, theme)
  }, [theme])

  /** Tombol "Jalankan": munculkan bubble, atau buka panel bila sudah tampil. */
  const launch = useCallback(() => {
    setStage((s) => (s === 'hidden' ? 'bubble' : 'panel'))
  }, [])

  /* Pintasan global: Ctrl/Cmd + K untuk buka–tutup widget */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setStage((s) => (s === 'panel' ? 'bubble' : 'panel'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const active = stage !== 'hidden'
  const page = (() => {
    switch (pathname) {
      case '/':
        return <Beranda onLaunch={launch} active={active} />
      case '/fitur':
        return <Fitur onLaunch={launch} active={active} />
      case '/cara-kerja':
        return <CaraKerja onLaunch={launch} active={active} />
      case '/penyedia':
        return <Penyedia onLaunch={launch} active={active} />
      case '/bawa-ke-mana-saja':
        return <BawaKeMana onLaunch={launch} active={active} />
      case '/faq':
        return <Faq onLaunch={launch} active={active} />
      default:
        return <NotFound path={pathname} />
    }
  })()

  return (
    <>
      <Shell
        onLaunch={launch}
        active={active}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      >
        {page}
      </Shell>
      {/* Widget hidup di luar halaman: obrolan tetap jalan saat berpindah menu. */}
      <Widget stage={stage} onStageChange={setStage} />
    </>
  )
}
