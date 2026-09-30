import { getRuntime } from './runtime'

const ns = () => getRuntime().storagePrefix

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(ns() + key)
    if (!raw) return fallback
    return { ...(fallback as object), ...(JSON.parse(raw) as object) } as T
  } catch {
    return fallback
  }
}

export function loadRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(ns() + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(ns() + key, JSON.stringify(value))
  } catch {
    /* storage penuh / mode privat — abaikan */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(ns() + key)
  } catch {
    /* abaikan */
  }
}

export const KEYS = {
  config: 'config',
  messages: 'messages',
  bubble: 'bubble-pos',
  panel: 'panel-geometry',
  theme: 'theme',
  scale: 'ui-scale',
  seen: 'onboarded',
  profiles: 'provider-profiles',
} as const
