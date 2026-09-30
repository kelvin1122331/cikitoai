import { useCallback, useEffect, useState } from 'react'
import type { WidgetStage } from './types'
import { KEYS, loadRaw, saveJSON } from './lib/storage'
import { setRuntime } from './lib/runtime'
import { Landing } from './components/Landing'
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

  return (
    <>
      <Landing
        onLaunch={launch}
        active={stage !== 'hidden'}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <Widget stage={stage} onStageChange={setStage} />
    </>
  )
}
