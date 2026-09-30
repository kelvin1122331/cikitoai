import { ExternalLink, KeyRound, Laptop } from 'lucide-react'
import { usePageMeta } from '../lib/router'
import { KIND_LABEL, PROVIDERS } from '../lib/providers'
import { CtaBanner, PageHero, Pager, SectionTitle } from '../site/parts'
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
    desc: 'Format Claude, termasuk penanganan blok thinking yang ditampilkan terpisah di panel chat.',
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

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="card grid gap-px overflow-hidden bg-ink-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-ink-800">
          {PROVIDERS.map((p, i) => (
            <article
              key={p.id}
              className="animate-fade-up flex flex-col bg-white p-6 transition-colors duration-200 hover:bg-ink-50/70 dark:bg-ink-950 dark:hover:bg-ink-900/40"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-ink-50 font-mono text-[10px] font-medium text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
                  {p.short}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-ink-950 dark:text-white">
                    {p.name}
                  </h2>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-500">
                    {KIND_LABEL[p.kind]}
                  </p>
                </div>
              </div>

              {p.note && (
                <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                  {p.note}
                </p>
              )}

              {p.models.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.models.slice(0, 3).map((m) => (
                    <code
                      key={m}
                      className="rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[0.65rem] text-ink-500 dark:border-ink-800 dark:text-ink-400"
                    >
                      {m}
                    </code>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink-200 pt-4 text-xs dark:border-ink-800">
                {p.noKey ? (
                  <span className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                    <Laptop className="size-3.5" /> Tanpa API key
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
                    <KeyRound className="size-3.5" /> Perlu API key
                  </span>
                )}
                {p.keyUrl && (
                  <a
                    href={p.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 font-medium text-ink-950 transition-opacity hover:opacity-70 dark:text-white"
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
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Di balik layar"
          title="Cukup tiga bentuk API untuk menjangkau semuanya"
          desc="Backend menormalisasi ketiganya menjadi satu aliran peristiwa yang sama, sehingga UI chat tidak perlu tahu sedang berbicara dengan siapa."
        />
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {SHAPES.map((s) => (
            <div key={s.kind} className="card p-6">
              <span className="eyebrow">{s.kind}</span>
              <code className="mt-4 block overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 p-3 font-mono text-[0.7rem] whitespace-nowrap text-ink-700 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
                {s.endpoint}
              </code>
              <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner
        onLaunch={onLaunch}
        active={active}
        title="Punya endpoint sendiri?"
        desc="Pilih penyedia Kustom, isi Base URL dan nama model — selesai. Termasuk server lokal seperti Ollama dan LM Studio."
      />
      <Pager path={route.path} />
    </>
  )
}
