import { memo, useState } from 'react'
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronDown,
  Copy,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import type { ChatMessage } from '../../types'
import { cn, copyText, formatTime } from '../../lib/utils'
import { Markdown } from '../Markdown'

interface Props {
  message: ChatMessage
  isLast: boolean
  onRegenerate: () => void
  onDelete: (id: string) => void
}

export const MessageItem = memo(function MessageItem({
  message,
  isLast,
  onRegenerate,
  onDelete,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    if (await copyText(message.content)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div
      className={cn(
        'group/msg flex animate-fade-up gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full shadow-sm',
          isUser
            ? 'bg-ink-200 text-ink-600 dark:bg-white/10 dark:text-ink-200'
            : message.error
              ? 'bg-red-500/15 text-red-500'
              : 'bg-gradient-to-br from-brand-500 to-cyan-400 text-white',
        )}
      >
        {isUser ? (
          <User className="size-3.5" />
        ) : message.error ? (
          <AlertTriangle className="size-3.5" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
      </div>

      <div className={cn('flex min-w-0 max-w-[88%] flex-col gap-1', isUser && 'items-end')}>
        {/* Penalaran (reasoning) */}
        {message.reasoning && (
          <div className="w-full overflow-hidden rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
            <button
              type="button"
              onClick={() => setShowReasoning((v) => !v)}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[0.72em] font-semibold text-amber-700 dark:text-amber-300"
            >
              <Brain className="size-3.5" />
              Proses berpikir
              <ChevronDown
                className={cn('ml-auto size-3.5 transition-transform', showReasoning && 'rotate-180')}
              />
            </button>
            {showReasoning && (
              <div className="thin-scrollbar max-h-40 overflow-y-auto border-t border-amber-500/20 px-2.5 py-2 text-[0.75em] leading-relaxed whitespace-pre-wrap text-amber-900/80 dark:text-amber-200/80">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Balon pesan */}
        <div
          className={cn(
            'relative rounded-2xl px-3.5 py-2.5 text-[0.85em] shadow-sm transition-colors',
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-brand-600 to-indigo-600 text-white'
              : message.error
                ? 'rounded-tl-sm border border-red-500/30 bg-red-500/[0.08] text-red-700 dark:text-red-200'
                : 'rounded-tl-sm border border-black/[0.06] bg-white text-ink-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-ink-100',
          )}
        >
          {isUser ? (
            <p className="leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <Markdown content={message.content} />
              {message.streaming && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-blink bg-brand-500" />
              )}
            </>
          )}
        </div>

        {/* Baris meta + aksi */}
        <div
          className={cn(
            'flex items-center gap-1 px-1 text-[0.65em] text-ink-400',
            isUser && 'flex-row-reverse',
          )}
        >
          <span className="tabular-nums">{formatTime(message.createdAt)}</span>
          {message.stopped && <span className="text-amber-500">· dihentikan</span>}
          {message.usage?.out ? <span>· {message.usage.out} token</span> : null}

          <div
            className={cn(
              'flex items-center gap-0.5 transition-opacity duration-150',
              'opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100',
              '[@media(hover:none)]:opacity-100',
            )}
          >
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Salin pesan"
              className="rounded p-1 hover:bg-black/[0.06] hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            </button>
            {!isUser && isLast && !message.streaming && (
              <button
                type="button"
                onClick={onRegenerate}
                aria-label="Buat ulang jawaban"
                className="rounded p-1 hover:bg-black/[0.06] hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <RefreshCw className="size-3" />
              </button>
            )}
            {!message.streaming && (
              <button
                type="button"
                onClick={() => onDelete(message.id)}
                aria-label="Hapus pesan"
                className="rounded p-1 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
