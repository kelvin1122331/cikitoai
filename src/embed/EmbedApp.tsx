import { useEffect, useState } from 'react'
import type { WidgetStage } from '../types'
import { Widget } from '../components/widget/Widget'

type StageSetter = (next: WidgetStage) => void

let controller: StageSetter | null = null
let pending: WidgetStage | null = null

/** Dipakai API imperatif window.CikitoAI.open()/close()/toggle(). */
export function commandStage(next: WidgetStage) {
  if (controller) controller(next)
  else pending = next
}

let currentStage: WidgetStage = 'bubble'
export const getStage = () => currentStage

interface Props {
  initialStage: WidgetStage
  hotkey: boolean
  onStage?: (stage: WidgetStage) => void
}

export function EmbedApp({ initialStage, hotkey, onStage }: Props) {
  const [stage, setStage] = useState<WidgetStage>(initialStage)

  useEffect(() => {
    controller = setStage
    if (pending) {
      setStage(pending)
      pending = null
    }
    return () => {
      controller = null
    }
  }, [])

  useEffect(() => {
    currentStage = stage
    onStage?.(stage)
  }, [stage, onStage])

  /* Pintasan Ctrl/Cmd + K (opsional, supaya tidak bentrok dengan situs tuan rumah). */
  useEffect(() => {
    if (!hotkey) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setStage((s) => (s === 'panel' ? 'bubble' : 'panel'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotkey])

  return <Widget stage={stage} onStageChange={setStage} embedded />
}
