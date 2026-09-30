export type ProviderKind = 'openai' | 'anthropic' | 'gemini' | 'demo'

export interface WireMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UpstreamConfig {
  kind?: ProviderKind
  baseUrl?: string
  apiKey?: string
  model?: string
  messages?: WireMessage[]
  system?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  extraHeaders?: Record<string, string>
  browser?: boolean
}

export interface NormalizedEvent {
  type: 'delta' | 'reasoning' | 'usage' | 'notice' | 'error' | 'done'
  text?: string
  message?: string
  usage?: { in: number | null; out: number | null }
}

export declare const ANTHROPIC_VERSION: string
export declare const DEFAULT_BASE: Record<'openai' | 'anthropic' | 'gemini', string>

export declare function stripSlash(url?: string): string
export declare function joinUrl(base: string, path: string): string
export declare function isLocalUrl(url?: string): boolean
export declare function humanizeUpstreamError(status: number, text: string): string

export declare function buildUpstreamRequest(
  cfg: UpstreamConfig,
  opts?: { stream?: boolean },
): { url: string; init: RequestInit }

export declare function buildModelsRequest(cfg: {
  kind?: ProviderKind
  baseUrl?: string
  apiKey?: string
}): { url: string; headers: Record<string, string> }

export declare function parseModelsResponse(
  kind: ProviderKind,
  data: unknown,
): { id: string; label?: string }[]

export declare function iterateLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string>
export declare function normalizeChunk(kind: ProviderKind, payload: unknown): NormalizedEvent[]
export declare function pumpProviderStream(
  kind: ProviderKind,
  body: ReadableStream<Uint8Array>,
  onEvent: (event: NormalizedEvent) => void,
): Promise<boolean>

export declare function demoReply(messages?: WireMessage[]): string
export declare function tokenizeForDemo(text: string): string[]
