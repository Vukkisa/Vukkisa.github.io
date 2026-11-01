import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** Shared pieces so the three Lab experiments look and behave alike. */

/** A row of radio "chips": native radios (arrow keys, one tab stop), styled as buttons. */
export function ChipChoice<T extends string | number>({ name, legend, options, value, onChange, labels }: {
  name: string
  legend: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  labels?: (v: T) => ReactNode
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-1.5">
      <legend className="lab-label mb-1.5 w-full">{legend}</legend>
      {options.map(o => {
        const on = o === value
        return (
          <label key={String(o)} className={cn('chip inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent', on ? 'border-fg bg-fg text-bg' : 'border-line text-soft hover:border-line-strong hover:text-fg')}>
            <input type="radio" name={name} value={String(o)} checked={on} onChange={() => onChange(o)} className="sr-only" />
            {labels ? labels(o) : String(o)}
          </label>
        )
      })}
    </fieldset>
  )
}

/** "How the real project does it" / "what's simulated" notes, in one consistent style. */
export function Note({ label, children, tone = 'mute' }: { label: string; children: ReactNode; tone?: 'mute' | 'accent' }) {
  return (
    <p className={cn('border-l-2 pl-3 text-sm leading-relaxed', tone === 'accent' ? 'border-accent text-soft' : 'border-line-strong text-mute')}>
      <span className="lab-label mr-1.5 align-baseline">{label}</span>
      {children}
    </p>
  )
}

/** A visible empty or error state inside an output panel. */
export function Empty({ children, role }: { children: ReactNode; role?: 'alert' }) {
  return <p role={role} className="px-3 py-6 text-center text-sm text-mute">{children}</p>
}
