import { m } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { Step } from '../data/content'
import { cn } from '../lib/utils'

const EASE = [0.25, 1, 0.5, 1] as const
const VIEW = { once: true, margin: '0px 0px -10% 0px' } as const

/**
 * A project's real pipeline, step by step. A rail draws in behind the steps as it scrolls into view.
 * Horizontal on wide screens, vertical on narrow ones. Steps marked `mine` are highlighted.
 */
export function Flow({ steps, label, note }: { steps: Step[]; label: string; note?: string }) {
  const hasMine = steps.some(s => s.mine)
  return (
    <div className="relative" style={{ '--n': steps.length } as CSSProperties}>
      <m.div
        aria-hidden="true"
        className="absolute bottom-4 left-[11px] top-4 w-px origin-top bg-rule-strong lg:bottom-auto lg:left-[calc(100%/(2*var(--n)))] lg:right-[calc(100%/(2*var(--n)))] lg:top-[11px] lg:h-px lg:w-auto lg:origin-left"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={VIEW}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <ol aria-label={label} className="relative grid gap-3 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-2">
        {steps.map((s, i) => (
          <m.li
            key={s.label}
            className="flex items-start gap-3 lg:flex-col lg:items-stretch"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.07 }}
          >
            <span
              aria-hidden="true"
              className={cn(
                'relative grid size-[23px] shrink-0 place-items-center rounded-full border font-mono text-[10px] lg:self-center',
                s.mine ? 'border-accent bg-accent text-paper' : 'border-rule-strong bg-paper text-mute',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('min-w-0 flex-1 rounded-md border px-3 py-2 lg:text-center', s.mine ? 'border-accent/50 bg-accent-soft' : 'border-rule bg-surface')}>
              <span className="block text-sm font-medium leading-snug text-ink">{s.label}</span>
              {s.detail && <span className="mt-0.5 block font-mono text-[11px] leading-snug text-mute">{s.detail}</span>}
              {s.mine && <span className="sr-only"> (built by me)</span>}
            </span>
          </m.li>
        ))}
      </ol>
      {hasMine && (
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mute">
          <span aria-hidden="true" className="mt-1 inline-block size-2.5 shrink-0 rounded-full bg-accent" /> {note ?? 'Highlighted: the part I built.'}
        </p>
      )}
    </div>
  )
}
