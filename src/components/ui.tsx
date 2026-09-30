import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

export function IconButton({
  className,
  active,
  tone = 'ghost',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  tone?: 'ghost' | 'danger' | 'solid'
}) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg transition-all duration-150',
        'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-0 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-40',
        tone === 'ghost' &&
          'text-ink-500 hover:bg-black/[0.06] hover:text-ink-900 active:scale-90 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white',
        tone === 'danger' &&
          'text-ink-500 hover:bg-red-500/10 hover:text-red-500 active:scale-90 dark:text-ink-300',
        tone === 'solid' && 'bg-brand-600 text-white shadow-sm hover:bg-brand-500 active:scale-95',
        active && 'bg-brand-500/15 text-brand-600 dark:bg-brand-400/20 dark:text-brand-200',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  htmlFor,
  right,
  children,
  className,
}: {
  label: string
  hint?: ReactNode
  htmlFor?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[0.8em] font-semibold text-ink-700 dark:text-ink-200"
        >
          {label}
        </label>
        {right}
      </div>
      {children}
      {hint && <p className="text-[0.72em] leading-snug text-ink-500 dark:text-ink-400">{hint}</p>}
    </div>
  )
}

export const inputClass = cn(
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[0.85em] text-ink-900',
  'placeholder:text-ink-400 transition-colors',
  'focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25 focus:outline-none',
  'dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-ink-500',
)

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(inputClass, className)} />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('size-4 animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current animate-bounce-dot"
          style={{ animationDelay: `${i * 0.14}s` }}
        />
      ))}
    </span>
  )
}
