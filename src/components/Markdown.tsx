import { memo, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn, copyText } from '../lib/utils'

/* ------------------------------------------------------------------ inline */

const INLINE_SRC = [
  '(`+)([\\s\\S]*?)\\1', // 1-2 kode inline
  '(\\*\\*|__)([\\s\\S]+?)\\3', // 3-4 tebal
  '(\\*|_)([^\\s*_][\\s\\S]*?)\\5', // 5-6 miring
  '~~([\\s\\S]+?)~~', // 7 coret
  '!?\\[([^\\]]*)\\]\\(([^)\\s]+)(?:\\s+"[^"]*")?\\)', // 8-9 tautan
  '(https?://[^\\s<>()\\[\\]]+)', // 10 URL polos
].join('|')

function safeHref(url: string): string | undefined {
  const u = url.trim()
  return /^(https?:|mailto:|tel:|#|\/)/i.test(u) ? u : undefined
}

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  // PENTING: regex dibuat baru tiap pemanggilan. Fungsi ini rekursif, sehingga
  // memakai satu instance /g bersama akan merusak `lastIndex` dan memicu loop tak berujung.
  const re = new RegExp(INLINE_SRC, 'g')
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    // `_miring_` di tengah kata (snake_case) diperlakukan sebagai teks biasa.
    if (m[5] === '_' && m.index > 0 && /[\w]/.test(text[m.index - 1])) continue

    if (m.index > last) out.push(text.slice(last, m.index))
    const k = `${key}-${i++}`

    if (m[1]) {
      out.push(
        <code
          key={k}
          className="rounded-[0.35em] border border-ink-200 bg-ink-100 px-[0.35em] py-[0.12em] font-mono text-[0.88em] text-ink-800 dark:border-ink-800 dark:bg-ink-800/80 dark:text-ink-100"
        >
          {m[2]}
        </code>,
      )
    } else if (m[3]) {
      out.push(
        <strong key={k} className="font-semibold text-ink-900 dark:text-white">
          {inline(m[4], k)}
        </strong>,
      )
    } else if (m[5]) {
      out.push(
        <em key={k} className="italic">
          {inline(m[6], k)}
        </em>,
      )
    } else if (m[7] !== undefined) {
      out.push(
        <del key={k} className="opacity-70">
          {inline(m[7], k)}
        </del>,
      )
    } else if (m[9] !== undefined) {
      const href = safeHref(m[9])
      out.push(
        href ? (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium text-brand-700 underline decoration-brand-500/40 underline-offset-2 transition hover:decoration-brand-500 dark:text-brand-400"
          >
            {inline(m[8] || m[9], k)}
          </a>
        ) : (
          <span key={k}>{m[8]}</span>
        ),
      )
    } else if (m[10]) {
      out.push(
        <a
          key={k}
          href={m[10]}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-medium break-all text-brand-700 underline decoration-brand-500/40 underline-offset-2 dark:text-brand-400"
        >
          {m[10]}
        </a>,
      )
    }
    last = m.index + m[0].length
  }

  if (last < text.length) out.push(text.slice(last))
  return out
}

/* -------------------------------------------------------------- code block */

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (await copyText(code)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <div className="group/code my-[0.75em] overflow-hidden rounded-xl border border-ink-200 bg-[#0d1224] dark:border-ink-800">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-1.5">
        <span className="font-mono text-[0.72em] tracking-wide text-ink-300 uppercase">
          {lang || 'kode'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.72em] font-medium text-ink-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Salin kode"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <pre className="thin-scrollbar overflow-x-auto p-3 text-[0.85em] leading-relaxed">
        <code className="font-mono text-[#e6e9f5] whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

/* ------------------------------------------------------------ block parser */

type Block =
  | { t: 'code'; code: string; lang?: string }
  | { t: 'heading'; level: number; text: string }
  | { t: 'quote'; lines: string[] }
  | { t: 'list'; ordered: boolean; items: { text: string; depth: number }[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'hr' }
  | { t: 'p'; text: string }

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim())
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // Blok kode berpagar
    const fence = line.match(/^\s*(`{3,}|~{3,})\s*([\w+#.-]*)/)
    if (fence) {
      const marker = fence[1][0]
      const body: string[] = []
      i++
      while (i < lines.length && !new RegExp(`^\\s*${marker === '`' ? '`' : '~'}{3,}\\s*$`).test(lines[i])) {
        body.push(lines[i])
        i++
      }
      i++ // lewati penutup
      blocks.push({ t: 'code', code: body.join('\n'), lang: fence[2] || undefined })
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push({ t: 'heading', level: heading[1].length, text: heading[2].trim() })
      i++
      continue
    }

    if (/^\s*([-*_])\s*\1\s*\1[\s*_-]*$/.test(line)) {
      blocks.push({ t: 'hr' })
      i++
      continue
    }

    if (/^\s*>/.test(line)) {
      const body: string[] = []
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      blocks.push({ t: 'quote', lines: body })
      continue
    }

    // Tabel gaya GFM
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      const head = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]))
        i++
      }
      blocks.push({ t: 'table', head, rows })
      continue
    }

    const listMatch = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2])
      const items: { text: string; depth: number }[] = []
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
        if (!m) {
          // Baris lanjutan dari item sebelumnya
          if (items.length && lines[i].trim() && /^\s{2,}/.test(lines[i])) {
            items[items.length - 1].text += '\n' + lines[i].trim()
            i++
            continue
          }
          break
        }
        items.push({ text: m[3], depth: Math.min(2, Math.floor(m[1].replace(/\t/g, '  ').length / 2)) })
        i++
      }
      blocks.push({ t: 'list', ordered, items })
      continue
    }

    // Paragraf
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(#{1,6}\s|>|```|~~~)/.test(lines[i]) &&
      !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i])
    ) {
      para.push(lines[i])
      i++
    }
    if (para.length) blocks.push({ t: 'p', text: para.join('\n') })
    else i++
  }

  return blocks
}

/* ---------------------------------------------------------------- renderer */

const HEADING_CLASS: Record<number, string> = {
  1: 'text-[1.3em] mt-[0.9em] mb-[0.45em]',
  2: 'text-[1.18em] mt-[0.85em] mb-[0.4em]',
  3: 'text-[1.08em] mt-[0.8em] mb-[0.35em]',
  4: 'text-[1em] mt-[0.7em] mb-[0.3em]',
  5: 'text-[0.95em] mt-[0.7em] mb-[0.3em]',
  6: 'text-[0.9em] mt-[0.7em] mb-[0.3em]',
}

function renderBlocks(blocks: Block[], keyPrefix = 'b'): ReactNode[] {
  return blocks.map((b, idx) => {
    const key = `${keyPrefix}-${idx}`
    switch (b.t) {
      case 'code':
        return <CodeBlock key={key} code={b.code} lang={b.lang} />

      case 'heading': {
        const Tag = `h${Math.min(6, b.level + 1)}` as 'h2'
        return (
          <Tag
            key={key}
            className={cn(
              'font-bold text-ink-900 first:mt-0 dark:text-white',
              HEADING_CLASS[b.level] ?? HEADING_CLASS[3],
            )}
          >
            {inline(b.text, key)}
          </Tag>
        )
      }

      case 'hr':
        return <hr key={key} className="my-[1em] border-ink-200 dark:border-ink-800" />

      case 'quote':
        return (
          <blockquote
            key={key}
            className="my-[0.7em] border-l-[3px] border-brand-400/70 bg-brand-500/[0.06] py-[0.35em] pl-[0.9em] text-ink-700 italic dark:text-ink-200"
          >
            {renderBlocks(parseBlocks(b.lines.join('\n')), key)}
          </blockquote>
        )

      case 'list': {
        const Tag = b.ordered ? 'ol' : 'ul'
        return (
          <Tag
            key={key}
            className={cn(
              'my-[0.6em] space-y-[0.3em] pl-[1.35em]',
              b.ordered ? 'list-decimal' : 'list-disc',
              'marker:text-brand-500/80 dark:marker:text-brand-300/80',
            )}
          >
            {b.items.map((it, j) => (
              <li
                key={`${key}-i${j}`}
                className="leading-relaxed"
                style={it.depth ? { marginLeft: `${it.depth * 1.1}em` } : undefined}
              >
                {inline(it.text, `${key}-i${j}`)}
              </li>
            ))}
          </Tag>
        )
      }

      case 'table':
        return (
          <div
            key={key}
            className="thin-scrollbar my-[0.8em] overflow-x-auto rounded-xl border border-ink-200 dark:border-ink-800"
          >
            <table className="w-full border-collapse text-left text-[0.9em]">
              <thead className="bg-ink-100 dark:bg-ink-900/60">
                <tr>
                  {b.head.map((h, j) => (
                    <th
                      key={j}
                      className="border-b border-ink-200 px-[0.8em] py-[0.5em] font-semibold whitespace-nowrap dark:border-ink-800"
                    >
                      {inline(h, `${key}-h${j}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r} className="even:bg-ink-50 dark:even:bg-ink-900/40">
                    {row.map((c, j) => (
                      <td
                        key={j}
                        className="border-b border-ink-200 px-[0.8em] py-[0.45em] align-top last:border-0 dark:border-white/5"
                      >
                        {inline(c, `${key}-c${r}-${j}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'p':
        return (
          <p key={key} className="my-[0.55em] leading-relaxed first:mt-0 last:mb-0">
            {b.text.split('\n').map((ln, j, arr) => (
              <span key={j}>
                {inline(ln, `${key}-l${j}`)}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
    }
  })
}

export const Markdown = memo(function Markdown({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return <div className={cn('break-words', className)}>{renderBlocks(parseBlocks(content))}</div>
})
