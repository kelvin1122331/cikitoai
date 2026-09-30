import { ExternalLink, Info, Laptop, KeyRound } from 'lucide-react'
import { usePageMeta } from '../lib/router'
import { KIND_LABEL, PROVIDERS } from '../lib/providers'
import { cn } from '../lib/utils'
import { CtaBanner, PageHero, Pager } from '../site/parts'
import { ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

const SHAPES = [
  {
    kind: 'openai',
    endpoint: 'POST {baseUrl}/chat/completions',
    desc: 'Standar de-facto. Dipakai OpenAI, Groq, OpenRouter, DeepSeek, Mistral, xAI, Together, Ollama, LM Studio, dan hampir semua layanan baru.',
  },
  {
    kind: 'anthropic',
    endpoint: 'POST {baseUrl}/v1/messages',
    desc: 'Format Claude, termasuk penanganan blok “thinking” yang ditampilkan terpisah di panel chat.',
  },
  {
    kind: 'gemini',
    endpoint: 'POST {baseUrl}/v1beta/models/{model}:streamGenerateContent',
    desc: 'Format Google Gemini, lengkap dengan penghitungan token dan alasan penghentian.',
  },
]

export function Penyedia({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/penyedia']
  usePageMeta(route.title, route.description)

  return (
    <>
      <PageHero
        route={route}
        title="Terhubung ke penyedia mana pun"
        subtitle="13 preset siap pakai plus endpoint kustom. Karena kolom model bebas diisi, model yang rilis besok pun langsung bisa dipakai tanpa memperbarui aplikasi."
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((p, i) => (
            <article
              key={p.id}
              className="animate-fade-up rounded-2xl border border-black/[0.07] bg-white/70 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300/60 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03]"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm',
                    p.accent,
                  )}
                >
                  {p.short}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">{p.name}</h3>
                  <p className="truncate text-[0.7rem] text-ink-500 dark:text-ink-400">
                    {KIND_LABEL[p.kind]}
                  </p>
                </div>
              </div>

              {p.note && (
                <p className="mt-3 flex gap-1.5 text-xs leading-relaxed text-ink-600 dark:text-ink-400">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
                  {p.note}
                </p>
              )}

              {p.models.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.models.slice(0, 3).map((m) => (
                    <code
                      key={m}
                      className="rounded-md bg-black/[0.04] px-1.5 py-0.5 font-mono text-[0.65rem] text-ink-600 dark:bg-white/[0.07] dark:text-ink-300"
                    >
                      {m}
                    </code>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-semibold">
                {p.noKey ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Laptop className="size-3.5" /> Tanpa API key
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-ink-500 dark:text-ink-400">
                    <KeyRound className="size-3.5" /> Perlu API key
                  </span>
                )}
                {p.keyUrl && (
                  <a
                    href={p.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:underline dark:text-brand-300"
                  >
                    Ambil key <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- tiga bentuk API */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-black/[0.07] bg-white/60 p-6 backdrop-blur sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02]">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Cukup tiga bentuk API untuk menjangkau semuanya
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-ink-600 dark:text-ink-300">
            Backend menormalisasi ketiganya menjadi satu aliran event yang sama, sehingga UI chat
            tidak perlu tahu sedang bicara dengan siapa.
          </p>
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {SHAPES.map((s) => (
              <div
                key={s.kind}
                className="rounded-2xl border border-black/[0.07] bg-white/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
              >
                <span className="text-[0.7rem] font-bold tracking-wide text-brand-600 uppercase dark:text-brand-300">
                  {s.kind}
                </span>
                <code className="mt-2 block overflow-x-auto rounded-lg bg-ink-950/95 p-2.5 font-mono text-[0.68rem] whitespace-nowrap text-ink-100">
                  {s.endpoint}
                </code>
                <p className="mt-2 text-xs leading-relaxed text-ink-600 dark:text-ink-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        onLaunch={onLaunch}
        active={active}
        title="Punya endpoint sendiri?"
        desc="Pilih penyedia “Kustom”, isi Base URL dan nama model — selesai. Termasuk server lokal seperti Ollama dan LM Studio."
      />
      <Pager path={route.path} />
    </>
  )
}
