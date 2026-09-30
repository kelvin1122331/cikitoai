import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, Info, Send, Settings2, Sparkles, Square, X } from 'lucide-react'
import type { AIConfig } from '../../types'
import type { useChat } from '../../hooks/useChat'
import { PROVIDER_MAP } from '../../lib/providers'
import { cn } from '../../lib/utils'
import { Dots } from '../ui'
import { MessageItem } from './MessageItem'

const SUGGESTIONS = [
  { icon: '💡', text: 'Jelaskan apa itu API dengan analogi sederhana' },
  { icon: '✍️', text: 'Buatkan caption Instagram untuk produk kopi lokal' },
  { icon: '🧑‍💻', text: 'Tulis fungsi JavaScript untuk memformat rupiah' },
  { icon: '📊', text: 'Bandingkan React dan Vue dalam bentuk tabel' },
]

interface Props {
  config: AIConfig
  chat: ReturnType<typeof useChat>
  onOpenSettings: () => void
  compact: boolean
}

export function ChatView({ config, chat, onOpenSettings, compact }: Props) {
  const { messages, isStreaming, notice, setNotice, send, stop, regenerate, removeMessage } = chat
  const [draft, setDraft] = useState('')
  const [atBottom, setAtBottom] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preset = PROVIDER_MAP[config.providerId]

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 64)
  }, [])

  useLayoutEffect(() => {
    if (atBottom) scrollToBottom(false)
  }, [messages, atBottom, scrollToBottom])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!compact) textareaRef.current?.focus()
    }, 220)
    return () => clearTimeout(t)
  }, [compact])

  const autoGrow = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 132)}px`
  }, [])

  const submit = useCallback(() => {
    const text = draft.trim()
    if (!text || isStreaming) return
    send(text)
    setDraft('')
    setAtBottom(true)
    requestAnimationFrame(() => {
      autoGrow()
      scrollToBottom()
    })
  }, [draft, isStreaming, send, autoGrow, scrollToBottom])

  const empty = messages.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col bg-ink-50/60 dark:bg-transparent">
      {/* Catatan / peringatan */}
      {notice && (
        <div className="flex animate-fade-in items-start gap-2 border-b border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[0.72em] leading-snug text-amber-800 dark:text-amber-200">
          <Info className="mt-px size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 break-words">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Tutup catatan">
            <X className="size-3.5 hover:opacity-70" />
          </button>
        </div>
      )}

      {/* Daftar pesan */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="thin-scrollbar relative min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3"
      >
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center px-2 py-6 text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 animate-ring rounded-2xl bg-brand-500/40" />
              <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-lg">
                <Sparkles className="size-6" />
              </div>
            </div>
            <h3 className="text-[1em] font-bold text-ink-900 dark:text-white">
              Halo! Mau tanya apa?
            </h3>
            <p className="mt-1 max-w-[30ch] text-[0.78em] leading-snug text-ink-500 dark:text-ink-400">
              Terhubung ke{' '}
              <span className="font-semibold text-brand-600 dark:text-brand-300">
                {preset?.name ?? 'penyedia kustom'}
              </span>
              {config.kind !== 'demo' && (
                <>
                  {' '}
                  · <span className="font-mono text-[0.95em]">{config.model}</span>
                </>
              )}
            </p>

            <div className={cn('mt-4 grid w-full gap-1.5', compact ? 'grid-cols-1' : 'grid-cols-2')}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => {
                    send(s.text)
                    setAtBottom(true)
                  }}
                  className="group flex items-start gap-2 rounded-xl border border-black/[0.07] bg-white p-2.5 text-left text-[0.74em] leading-snug text-ink-600 shadow-sm transition-all hover:-translate-y-px hover:border-brand-300 hover:text-ink-900 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-ink-300 dark:hover:text-white"
                >
                  <span className="text-[1.1em]">{s.icon}</span>
                  <span className="min-w-0 flex-1">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <MessageItem
                key={m.id}
                message={m}
                isLast={i === messages.length - 1}
                onRegenerate={regenerate}
                onDelete={removeMessage}
              />
            ))}
            {isStreaming && !messages[messages.length - 1]?.content && (
              <div className="flex items-center gap-2 pl-10 text-brand-500">
                <Dots />
                <span className="text-[0.7em] text-ink-400">sedang mengetik…</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tombol kembali ke bawah */}
      {!atBottom && !empty && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          aria-label="Gulir ke pesan terbaru"
          className="absolute bottom-24 left-1/2 z-10 grid size-8 -translate-x-1/2 place-items-center rounded-full border border-black/10 bg-white text-ink-600 shadow-lg transition hover:scale-110 dark:border-white/15 dark:bg-ink-800 dark:text-ink-200"
        >
          <ArrowDown className="size-4" />
        </button>
      )}

      {/* Komposer */}
      <div className="shrink-0 border-t border-black/[0.07] bg-white/80 p-2.5 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/60">
        <div
          className={cn(
            'flex items-end gap-1.5 rounded-2xl border bg-white px-2 py-1.5 transition-all dark:bg-white/[0.04]',
            'border-black/10 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20 dark:border-white/10',
          )}
        >
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Ubah pengaturan API"
            className="mb-0.5 grid size-8 shrink-0 place-items-center rounded-xl text-ink-400 transition hover:bg-black/[0.05] hover:text-brand-600 dark:hover:bg-white/10 dark:hover:text-brand-300"
          >
            <Settings2 className="size-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={draft}
            rows={1}
            placeholder="Tanya apa saja…"
            onChange={(e) => {
              setDraft(e.target.value)
              autoGrow()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submit()
              }
            }}
            className="thin-scrollbar max-h-[132px] min-h-[36px] flex-1 resize-none border-0 bg-transparent py-2 text-[0.85em] leading-snug text-ink-900 placeholder:text-ink-400 focus:ring-0 focus:outline-none dark:text-white"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Hentikan jawaban"
              className="mb-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-red-500 text-white shadow transition hover:bg-red-600 active:scale-95"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              aria-label="Kirim pesan"
              className={cn(
                'mb-0.5 grid size-8 shrink-0 place-items-center rounded-xl text-white shadow transition-all active:scale-95',
                draft.trim()
                  ? 'bg-gradient-to-br from-brand-600 to-indigo-500 hover:shadow-lg'
                  : 'cursor-not-allowed bg-ink-300 dark:bg-white/10',
              )}
            >
              <Send className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[0.62em] text-ink-400">
          <span className="truncate">
            <kbd className="rounded border border-black/10 px-1 dark:border-white/15">Enter</kbd>{' '}
            kirim ·{' '}
            <kbd className="rounded border border-black/10 px-1 dark:border-white/15">Shift</kbd>+
            <kbd className="rounded border border-black/10 px-1 dark:border-white/15">Enter</kbd>{' '}
            baris baru
          </span>
          <span className="shrink-0 truncate font-mono">
            {config.kind === 'demo' ? 'mode demo' : config.model}
          </span>
        </div>
      </div>
    </div>
  )
}
