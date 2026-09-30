import { useCallback, useEffect, useState } from 'react'

/**
 * Status pemasangan aplikasi (PWA).
 *
 * Chrome/Edge memunculkan event `beforeinstallprompt` hanya bila syaratnya
 * terpenuhi: manifest valid, ikon 192 & 512, service worker dengan handler
 * fetch, dan konteks aman (HTTPS). Peramban lain (Safari, Firefox) tidak
 * punya event ini — di sana pemasangan dilakukan manual lewat menu.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    setInstalled(!!standalone)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!promptEvent) return 'unavailable' as const
    setBusy(true)
    try {
      await promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setPromptEvent(null)
      return outcome
    } finally {
      setBusy(false)
    }
  }, [promptEvent])

  return { canInstall: !!promptEvent, installed, busy, install }
}
