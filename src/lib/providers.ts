import type { AIConfig, ProviderPreset } from '../types'

/**
 * Katalog penyedia AI.
 * Kolom model SELALU bebas diisi — daftar di bawah hanya saran cepat.
 */
export const PROVIDERS: ProviderPreset[] = [
  {
    id: 'demo',
    name: 'Mode Demo',
    kind: 'demo',
    baseUrl: '',
    keyPlaceholder: 'tidak perlu API key',
    models: ['cikito-demo'],
    short: 'DM',
    accent: 'from-emerald-400 to-teal-500',
    noKey: true,
    note: 'Jawaban simulasi lokal. Cocok untuk mencoba tampilan tanpa API key.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    keyPlaceholder: 'sk-proj-…',
    keyUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini'],
    short: 'AI',
    accent: 'from-slate-700 to-slate-900',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    keyPlaceholder: 'sk-ant-…',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-5-haiku-latest',
    ],
    short: 'CL',
    accent: 'from-orange-400 to-amber-600',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    kind: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    keyPlaceholder: 'AIza…',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
    short: 'GE',
    accent: 'from-sky-400 to-blue-600',
  },
  {
    id: 'groq',
    name: 'Groq',
    kind: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyPlaceholder: 'gsk_…',
    keyUrl: 'https://console.groq.com/keys',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'qwen/qwen3-32b'],
    short: 'GQ',
    accent: 'from-rose-400 to-red-600',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    kind: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyPlaceholder: 'sk-or-v1-…',
    keyUrl: 'https://openrouter.ai/keys',
    models: [
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-2.0-flash-001',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.3-70b-instruct',
    ],
    short: 'OR',
    accent: 'from-indigo-400 to-violet-600',
    note: 'Satu API key untuk ratusan model dari banyak penyedia.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    kind: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    keyPlaceholder: 'sk-…',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    short: 'DS',
    accent: 'from-blue-500 to-indigo-700',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    kind: 'openai',
    baseUrl: 'https://api.mistral.ai/v1',
    keyPlaceholder: 'API key Mistral',
    keyUrl: 'https://console.mistral.ai/api-keys',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-nemo'],
    short: 'MS',
    accent: 'from-amber-400 to-orange-600',
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    kind: 'openai',
    baseUrl: 'https://api.x.ai/v1',
    keyPlaceholder: 'xai-…',
    keyUrl: 'https://console.x.ai',
    models: ['grok-3-mini', 'grok-3', 'grok-2-latest'],
    short: 'XA',
    accent: 'from-neutral-600 to-neutral-900',
  },
  {
    id: 'together',
    name: 'Together AI',
    kind: 'openai',
    baseUrl: 'https://api.together.xyz/v1',
    keyPlaceholder: 'API key Together',
    keyUrl: 'https://api.together.ai/settings/api-keys',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
    ],
    short: 'TG',
    accent: 'from-fuchsia-400 to-purple-600',
  },
  {
    id: 'ollama',
    name: 'Ollama (lokal)',
    kind: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    keyPlaceholder: 'kosongkan saja',
    keyUrl: 'https://ollama.com/download',
    models: ['llama3.2', 'qwen2.5', 'gemma3', 'phi4', 'mistral'],
    short: 'OL',
    accent: 'from-lime-400 to-green-600',
    noKey: true,
    editableBase: true,
    note: 'Model berjalan di komputer sendiri. Server harus bisa diakses dari backend ini.',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (lokal)',
    kind: 'openai',
    baseUrl: 'http://localhost:1234/v1',
    keyPlaceholder: 'kosongkan saja',
    models: ['local-model'],
    short: 'LM',
    accent: 'from-cyan-400 to-sky-600',
    noKey: true,
    editableBase: true,
  },
  {
    id: 'custom',
    name: 'Kustom / lainnya',
    kind: 'openai',
    baseUrl: '',
    keyPlaceholder: 'API key milikmu',
    models: [],
    short: '＋',
    accent: 'from-brand-400 to-cyan-500',
    editableBase: true,
    note: 'Masukkan Base URL apa pun yang kompatibel OpenAI / Anthropic / Gemini.',
  },
]

export const PROVIDER_MAP: Record<string, ProviderPreset> = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p]),
)

export const KIND_LABEL: Record<string, string> = {
  openai: 'OpenAI-compatible (/chat/completions)',
  anthropic: 'Anthropic Messages (/v1/messages)',
  gemini: 'Google Gemini (generateContent)',
  demo: 'Demo lokal',
}

export const DEFAULT_SYSTEM_PROMPT =
  'Kamu adalah CikitoAI, asisten yang ramah, cerdas, dan to the point. ' +
  'Jawab dengan bahasa yang sama seperti bahasa yang dipakai pengguna. ' +
  'Gunakan Markdown (judul, daftar, tabel, blok kode) bila membuat jawaban lebih jelas.'

export function defaultConfig(providerId = 'openai'): AIConfig {
  const p = PROVIDER_MAP[providerId] ?? PROVIDERS[0]
  return {
    providerId: p.id,
    kind: p.kind,
    baseUrl: p.baseUrl,
    apiKey: '',
    model: p.models[0] ?? '',
    system: DEFAULT_SYSTEM_PROMPT,
    temperature: 0.7,
    maxTokens: 2048,
  }
}

export function isConfigReady(cfg: AIConfig | null): boolean {
  if (!cfg) return false
  if (cfg.kind === 'demo') return true
  if (!cfg.model.trim()) return false
  const preset = PROVIDER_MAP[cfg.providerId]
  const local = /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/.test(cfg.baseUrl)
  if (!cfg.baseUrl.trim()) return false
  if (!cfg.apiKey.trim() && !preset?.noKey && !local) return false
  return true
}
