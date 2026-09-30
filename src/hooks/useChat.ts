import { useCallback, useEffect, useRef, useState } from 'react'
import type { AIConfig, ChatMessage, StreamEvent } from '../types'
import { streamChat } from '../lib/stream'
import { KEYS, loadRaw, saveJSON } from '../lib/storage'
import { uid } from '../lib/utils'

const MAX_STORED = 120

export function useChat(config: AIConfig | null) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadRaw<ChatMessage[]>(KEYS.messages, []).map((m) => ({ ...m, streaming: false })),
  )
  const [isStreaming, setIsStreaming] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const bufferRef = useRef<{ text: string; reasoning: string; id: string | null }>({
    text: '',
    reasoning: '',
    id: null,
  })
  const frameRef = useRef<number | null>(null)
  const configRef = useRef(config)
  configRef.current = config
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  useEffect(() => {
    saveJSON(KEYS.messages, messages.slice(-MAX_STORED))
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  /** Kumpulkan token lalu terapkan sekali per frame — jauh lebih ringan. */
  const flush = useCallback(() => {
    frameRef.current = null
    const buf = bufferRef.current
    if (!buf.id || (!buf.text && !buf.reasoning)) return
    const { id, text, reasoning } = buf
    buf.text = ''
    buf.reasoning = ''
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              content: m.content + text,
              reasoning: reasoning ? (m.reasoning ?? '') + reasoning : m.reasoning,
            }
          : m,
      ),
    )
  }, [])

  const schedule = useCallback(() => {
    if (frameRef.current == null) frameRef.current = requestAnimationFrame(flush)
  }, [flush])

  const run = useCallback(
    async (history: ChatMessage[]) => {
      const cfg = configRef.current
      if (!cfg) return

      const assistantId = uid('a')
      bufferRef.current = { text: '', reasoning: '', id: assistantId }
      setNotice(null)
      setMessages([
        ...history,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: Date.now(),
          streaming: true,
        },
      ])

      const controller = new AbortController()
      abortRef.current = controller
      setIsStreaming(true)

      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)))

      const onEvent = (ev: StreamEvent) => {
        switch (ev.type) {
          case 'delta':
            bufferRef.current.text += ev.text ?? ''
            schedule()
            break
          case 'reasoning':
            bufferRef.current.reasoning += ev.text ?? ''
            schedule()
            break
          case 'usage':
            patch((m) => ({ ...m, usage: ev.usage }))
            break
          case 'notice':
            setNotice(ev.message ?? null)
            break
          case 'error':
            flush()
            patch((m) => ({
              ...m,
              error: true,
              content: m.content || (ev.message ?? 'Terjadi kesalahan.'),
            }))
            if (bufferRef.current.id) {
              // Jika sudah ada teks parsial, tampilkan error sebagai catatan terpisah.
              setNotice(ev.message ?? null)
            }
            break
          case 'done':
            break
        }
      }

      try {
        await streamChat({ config: cfg, messages: history, signal: controller.signal, onEvent })
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          patch((m) => ({
            ...m,
            error: true,
            content:
              m.content ||
              `Gagal menghubungi server: ${err instanceof Error ? err.message : String(err)}`,
          }))
        }
      } finally {
        if (frameRef.current != null) {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = null
        }
        flush()
        const aborted = controller.signal.aborted
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  streaming: false,
                  stopped: aborted,
                  content:
                    m.content ||
                    (aborted ? '_(dihentikan sebelum ada jawaban)_' : '_(jawaban kosong)_'),
                }
              : m,
          ),
        )
        bufferRef.current = { text: '', reasoning: '', id: null }
        abortRef.current = null
        setIsStreaming(false)
      }
    },
    [flush, schedule],
  )

  const send = useCallback(
    (text: string) => {
      const content = text.trim()
      if (!content || abortRef.current) return
      const userMsg: ChatMessage = { id: uid('u'), role: 'user', content, createdAt: Date.now() }
      const history = [...messagesRef.current, userMsg]
      messagesRef.current = history
      setMessages(history)
      void run(history)
    },
    [run],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])

  const regenerate = useCallback(() => {
    if (abortRef.current) return
    const prev = messagesRef.current
    let cut = prev.length
    while (cut > 0 && prev[cut - 1].role === 'assistant') cut--
    const history = prev.slice(0, cut)
    if (!history.length) return
    messagesRef.current = history
    setMessages(history)
    void run(history)
  }, [run])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setNotice(null)
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return { messages, isStreaming, notice, setNotice, send, stop, regenerate, clear, removeMessage }
}
