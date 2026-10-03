import { AnimatePresence, m } from 'framer-motion'
import { useState } from 'react'
import { Section } from '../components/ui/Section'
import { StatusBadge } from '../components/ui/StatusBadge'
import { lab, type Status } from '../data/content'
import { cn } from '../lib/utils'

const ORDER: Status[] = ['SHIPPED', 'BUILDING', 'EXPERIMENT', 'LEARNING', 'ABANDONED']

/** Where unfinished ideas live, labelled honestly. */
export function Lab() {
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const present = ORDER.filter(s => lab.some(x => x.status === s))
  const list = lab.map((x, i) => ({ ...x, n: i + 1 })).filter(x => filter === 'ALL' || x.status === filter)

  return (
    <Section
      id="lab"
      path="~/lab"
      title={<>THE LAB<span className="text-amber">.</span></>}
      intro="Where unfinished ideas live. Not everything in here works yet, and some of it never will. That's what a lab is for."
    >
      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {(['ALL', ...present] as const).map(s => {
          const count = s === 'ALL' ? lab.length : lab.filter(x => x.status === s).length
          return (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={cn('rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] transition-colors', filter === s ? 'border-fg bg-fg text-bg' : 'border-rule text-mute hover:border-soft hover:text-fg')}
            >
              {s} <span className={filter === s ? 'text-bg/60' : 'text-dim'}>{count}</span>
            </button>
          )
        })}
      </div>

      <ol className="mt-10 border-t border-rule" aria-live="polite">
        <AnimatePresence initial={false}>
          {list.map(x => (
            <m.li
              key={x.name}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-rule py-7 md:grid-cols-[3rem_minmax(0,5fr)_minmax(0,6fr)_8.5rem] md:items-baseline"
            >
              <span className="font-mono text-xs text-dim">{String(x.n).padStart(2, '0')}</span>
              <h3 className="display text-[1.9rem] leading-tight">
                {x.link ? <a href={x.link} className="decoration-amber/50 underline-offset-4 hover:text-amber hover:underline">{x.name}</a> : x.name}
              </h3>
              <div className="col-start-2 md:col-start-auto">
                <p className="leading-relaxed text-soft">{x.idea}</p>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-mute"><span className="text-amber">?</span> {x.question}</p>
              </div>
              <div className="col-start-2 md:col-start-auto md:text-right"><StatusBadge status={x.status} /></div>
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
    </Section>
  )
}
