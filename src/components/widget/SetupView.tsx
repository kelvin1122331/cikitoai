import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  KeyRound,
  ListRestart,
  Play,
  PlugZap,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { AIConfig, ProviderKind } from '../../types'
import { DEFAULT_SYSTEM_PROMPT, KIND_LABEL, PROVIDERS, PROVIDER_MAP, isConfigReady } from '../../lib/providers'
import { fetchModels, testConnection } from '../../lib/stream'
import { KEYS, loadRaw, saveJSON } from '../../lib/storage'
import { cn } from '../../lib/utils'
import { Field, IconButton, Spinner, TextInput, inputClass } from '../ui'

type ProfileMap = Record<
  string,
  { apiKey?: string; baseUrl?: string; model?: string; kind?: ProviderKind }
>

interface Props {
  config: AIConfig
  onChange: (next: AIConfig) => void
  onRun: () => void
  onBack?: () => void
  compact: boolean
}

export function SetupView({ config, onChange, onRun, onBack, compact }: Props) {
  const preset = PROVIDER_MAP[config.providerId] ?? PROVIDERS[0]
  const [showKey, setShowKey] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [models, setModels] = useState<{ id: string; label?: string }[]>([])
  const [modelsOpen, setModelsOpen] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  /**
   * Ingat API key / Base URL / model per penyedia, supaya berpindah penyedia
   * tidak menghapus isian yang sudah dimasukkan sebelumnya.
   */
  const profiles = useRef<ProfileMap>(loadRaw<ProfileMap>(KEYS.profiles, {}))
  const rememberCurrent = () => {
    profiles.current[config.providerId] = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      kind: config.kind,
    }
    saveJSON(KEYS.profiles, profiles.current)
  }
  useEffect(() => {
    const t = window.setTimeout(rememberCurrent, 400)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.apiKey, config.baseUrl, config.model, config.providerId])

  const ready = isConfigReady(config)
  const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/.test(config.baseUrl)
  const keyOptional = preset.noKey || isLocal

  const set = (patch: Partial<AIConfig>) => onChange({ ...config, ...patch })

  const pickProvider = (id: string) => {
    const p = PROVIDER_MAP[id]
    if (!p || p.id === config.providerId) return
    rememberCurrent()
    setModels([])
    setModelsOpen(false)
    setResult(null)
    const saved = profiles.current[p.id] ?? {}
    onChange({
      ...config,
      providerId: p.id,
      kind: p.id === 'custom' ? (saved.kind ?? p.kind) : p.kind,
      baseUrl: saved.baseUrl || p.baseUrl,
      model: saved.model || p.models[0] || '',
      apiKey: p.noKey ? '' : (saved.apiKey ?? ''),
    })
  }

  const loadModels = async () => {
    setLoadingModels(true)
    setResult(null)
    try {
      const list = await fetchModels(config)
      setModels(list)
      setModelsOpen(true)
      if (!list.length) setResult({ ok: false, message: 'Penyedia tidak mengembalikan daftar model.' })
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : String(err) })
    } finally {
      setLoadingModels(false)
    }
  }

  const runTest = async () => {
    setTesting(true)
    setResult(null)
    setResult(await testConnection(config))
    setTesting(false)
  }

  const filteredModels = useMemo(() => {
    const q = config.model.trim().toLowerCase()
    if (!q) return models.slice(0, 200)
    return models.filter((m) => m.id.toLowerCase().includes(q) || m.label?.toLowerCase().includes(q)).slice(0, 200)
  }, [models, config.model])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setModelsOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="thin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
        {/* Penyedia */}
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-[0.82em] font-bold text-ink-800 dark:text-ink-100">
              <PlugZap className="size-[1.1em] text-brand-500" />
              Pilih penyedia AI
            </h3>
            <span className="text-[0.7em] text-ink-400">{PROVIDERS.length} opsi</span>
          </div>

          <div className={cn('grid gap-1.5', compact ? 'grid-cols-2' : 'grid-cols-3')}>
            {PROVIDERS.map((p) => {
              const selected = p.id === config.providerId
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickProvider(p.id)}
                  aria-pressed={selected}
                  className={cn(
                    'group relative flex items-center gap-2 rounded-xl border p-2 text-left transition-all duration-150',
                    selected
                      ? 'border-brand-400 bg-brand-500/10 shadow-[0_0_0_3px_rgba(124,77,255,0.12)]'
                      : 'border-black/10 hover:border-brand-300 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/5',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-[0.6em] font-bold text-white shadow-sm',
                      p.accent,
                    )}
                  >
                    {p.short}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.74em] leading-tight font-semibold text-ink-800 dark:text-ink-100">
                      {p.name}
                    </span>
                  </span>
                  {selected && <Check className="size-3.5 shrink-0 text-brand-500" strokeWidth={3} />}
                </button>
              )
            })}
          </div>

          {preset.note && (
            <p className="flex gap-1.5 rounded-lg bg-brand-500/[0.07] px-2.5 py-2 text-[0.72em] leading-snug text-ink-600 dark:text-ink-300">
              <Info className="mt-px size-3.5 shrink-0 text-brand-500" />
              {preset.note}
            </p>
          )}
        </section>

        {config.kind !== 'demo' && (
          <>
            {/* Format API untuk penyedia kustom */}
            {preset.id === 'custom' && (
              <Field label="Format API" hint="Pilih bentuk endpoint yang dipakai server tujuan.">
                <div className="relative">
                  <select
                    value={config.kind}
                    onChange={(e) => set({ kind: e.target.value as ProviderKind })}
                    className={cn(inputClass, 'appearance-none pr-9')}
                  >
                    {(['openai', 'anthropic', 'gemini'] as const).map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-400" />
                </div>
              </Field>
            )}

            {/* Base URL */}
            <Field
              label="Base URL"
              htmlFor="cikito-base"
              hint={
                preset.editableBase
                  ? 'Contoh: https://api.contoh.ai/v1 — tanpa /chat/completions.'
                  : 'Sudah terisi otomatis. Ubah hanya jika memakai proxy/gateway sendiri.'
              }
              right={
                config.baseUrl !== preset.baseUrl && preset.baseUrl ? (
                  <button
                    type="button"
                    onClick={() => set({ baseUrl: preset.baseUrl })}
                    className="flex items-center gap-1 text-[0.7em] font-medium text-brand-600 hover:underline dark:text-brand-300"
                  >
                    <RotateCcw className="size-3" /> Kembalikan
                  </button>
                ) : undefined
              }
            >
              <TextInput
                id="cikito-base"
                value={config.baseUrl}
                spellCheck={false}
                autoComplete="off"
                placeholder="https://api.penyedia.ai/v1"
                onChange={(e) => set({ baseUrl: e.target.value })}
                className="font-mono text-[0.78em]"
              />
            </Field>

            {/* API key */}
            <Field
              label={keyOptional ? 'API key (opsional)' : 'API key'}
              htmlFor="cikito-key"
              hint={
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Disimpan hanya di browser kamu (localStorage) dan diteruskan langsung ke penyedia.
                </span>
              }
              right={
                preset.keyUrl ? (
                  <a
                    href={preset.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[0.7em] font-medium text-brand-600 hover:underline dark:text-brand-300"
                  >
                    Ambil key <ExternalLink className="size-3" />
                  </a>
                ) : undefined
              }
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-400" />
                <input
                  id="cikito-key"
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={preset.keyPlaceholder}
                  onChange={(e) => set({ apiKey: e.target.value })}
                  className={cn(inputClass, 'pr-10 pl-9 font-mono text-[0.78em]')}
                />
                <IconButton
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Sembunyikan key' : 'Tampilkan key'}
                  className="absolute top-1/2 right-1.5 size-7 -translate-y-1/2"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </IconButton>
              </div>
            </Field>

            {/* Model — bebas diisi apa pun */}
            <Field
              label="Model AI"
              htmlFor="cikito-model"
              hint="Ketik nama model apa pun — kolom ini bebas. Atau muat daftar dari penyedia."
              right={
                <button
                  type="button"
                  onClick={loadModels}
                  disabled={loadingModels}
                  className="flex items-center gap-1 text-[0.7em] font-medium text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-300"
                >
                  {loadingModels ? <Spinner className="size-3" /> : <ListRestart className="size-3" />}
                  Muat daftar model
                </button>
              }
            >
              <div className="relative" ref={listRef}>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-400" />
                <input
                  id="cikito-model"
                  value={config.model}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="mis. gpt-4o-mini, claude-3-5-sonnet-latest, llama3.2…"
                  onChange={(e) => set({ model: e.target.value })}
                  onFocus={() => models.length && setModelsOpen(true)}
                  className={cn(inputClass, 'pl-9 font-mono text-[0.78em]')}
                />

                {modelsOpen && filteredModels.length > 0 && (
                  <div className="thin-scrollbar absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-black/10 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-ink-900">
                    {filteredModels.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          set({ model: m.id })
                          setModelsOpen(false)
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left font-mono text-[0.72em] hover:bg-brand-500/10"
                      >
                        <span className="truncate">{m.id}</span>
                        {m.label && (
                          <span className="shrink-0 truncate font-sans text-[0.9em] text-ink-400">
                            {m.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {preset.models.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {preset.models.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set({ model: m })}
                      className={cn(
                        'rounded-md border px-1.5 py-0.5 font-mono text-[0.66em] transition',
                        config.model === m
                          ? 'border-brand-400 bg-brand-500/15 text-brand-700 dark:text-brand-200'
                          : 'border-black/10 text-ink-500 hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:text-ink-400',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </>
        )}

        {/* Pengaturan lanjutan */}
        <section className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            aria-expanded={advanced}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[0.78em] font-semibold text-ink-700 transition hover:bg-black/[0.03] dark:text-ink-200 dark:hover:bg-white/5"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-[1.05em] text-brand-500" />
              Pengaturan lanjutan
            </span>
            <ChevronDown className={cn('size-4 transition-transform', advanced && 'rotate-180')} />
          </button>

          {advanced && (
            <div className="space-y-3 border-t border-black/10 p-3 dark:border-white/10">
              <Field label="Instruksi sistem" hint="Menentukan gaya dan peran asisten.">
                <textarea
                  value={config.system}
                  rows={3}
                  onChange={(e) => set({ system: e.target.value })}
                  className={cn(inputClass, 'thin-scrollbar resize-y leading-relaxed')}
                />
                {config.system !== DEFAULT_SYSTEM_PROMPT && (
                  <button
                    type="button"
                    onClick={() => set({ system: DEFAULT_SYSTEM_PROMPT })}
                    className="text-[0.7em] font-medium text-brand-600 hover:underline dark:text-brand-300"
                  >
                    Kembalikan ke bawaan
                  </button>
                )}
              </Field>

              <Field
                label={`Temperature — ${config.temperature.toFixed(2)}`}
                hint="Rendah = konsisten & faktual, tinggi = kreatif."
              >
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={config.temperature}
                  onChange={(e) => set({ temperature: Number(e.target.value) })}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-sky-400 via-brand-500 to-rose-400 accent-brand-600"
                />
              </Field>

              <Field label="Maksimum token jawaban">
                <TextInput
                  type="number"
                  min={64}
                  max={32768}
                  step={64}
                  value={config.maxTokens}
                  onChange={(e) => set({ maxTokens: Math.max(64, Number(e.target.value) || 2048) })}
                />
              </Field>
            </div>
          )}
        </section>

        {/* Hasil tes koneksi */}
        {result && (
          <div
            className={cn(
              'flex animate-fade-in items-start gap-2 rounded-xl border p-2.5 text-[0.75em] leading-snug',
              result.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {result.ok ? (
              <Check className="mt-px size-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-px size-4 shrink-0" />
            )}
            <span className="max-h-28 overflow-y-auto break-words whitespace-pre-wrap">
              {result.message}
            </span>
          </div>
        )}
      </div>

      {/* Aksi */}
      <div className="shrink-0 space-y-2 border-t border-black/[0.07] bg-white/60 p-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-black/10 px-3 py-2.5 text-[0.8em] font-semibold text-ink-600 transition hover:bg-black/[0.04] dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/5"
            >
              <ArrowLeft className="size-4" />
              {!compact && 'Kembali'}
            </button>
          )}

          {config.kind !== 'demo' && (
            <button
              type="button"
              onClick={runTest}
              disabled={testing || !ready}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-black/10 px-3 py-2.5 text-[0.8em] font-semibold text-ink-600 transition hover:bg-black/[0.04] disabled:opacity-40 dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/5"
            >
              {testing ? <Spinner className="size-4" /> : <PlugZap className="size-4" />}
              {!compact && (testing ? 'Menguji…' : 'Tes koneksi')}
            </button>
          )}

          <button
            type="button"
            onClick={onRun}
            disabled={!ready}
            className={cn(
              'group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2.5',
              'text-[0.85em] font-bold text-white transition-all duration-200',
              'bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500',
              'shadow-[0_8px_20px_-6px_rgba(109,43,245,0.6)] hover:shadow-[0_10px_26px_-6px_rgba(109,43,245,0.75)]',
              'hover:-translate-y-px active:translate-y-0 active:scale-[0.99]',
              'disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            <Play className="size-4 fill-current" />
            Jalankan
          </button>
        </div>

        {!ready && (
          <p className="text-center text-[0.68em] text-ink-400">
            Lengkapi {config.model.trim() ? 'API key' : 'nama model'} dulu, atau pilih{' '}
            <button
              type="button"
              onClick={() => pickProvider('demo')}
              className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Mode Demo
            </button>{' '}
            untuk mencoba tanpa API.
          </p>
        )}
      </div>
    </div>
  )
}
