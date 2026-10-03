import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LayerNet } from '../components/LayerNet'
import { Section } from '../components/ui/Section'
import { evolution, type Stage } from '../data/content'
import { cn } from '../lib/utils'

function StageBlock({ stage, index, active, onEnter, register }: { stage: Stage; index: number; active: boolean; onEnter: () => void; register: (el: HTMLLIElement | null) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView) onEnter() }, [inView, onEnter])
  const rows = [['working on', stage.working], ['learned', stage.learned], ['what changed', stage.changed]] as const
  return (
    <li
      ref={el => { ref.current = el; register(el) }}
      aria-current={active ? 'step' : undefined}
      className={cn('relative scroll-mt-40 border-t border-rule py-12 pl-6 lg:flex lg:min-h-[62vh] lg:flex-col lg:justify-center')}
    >
      <span aria-hidden="true" className={cn('absolute bottom-12 left-0 top-12 w-0.5 origin-top transition-all duration-500', active ? 'scale-y-100 bg-amber' : 'scale-y-50 bg-rule')} />
      <p className="font-mono text-xs text-amber">{stage.year}<span className="text-dim"> · stage {index + 1} of {evolution.length}</span></p>
      <h3 className={cn('display mt-3 text-[clamp(2rem,4.4vw,3.4rem)] transition-colors duration-500', active ? 'text-fg' : 'text-mute')}>{stage.title}</h3>
      <dl className="mt-8 space-y-5">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6">
            <dt className="label pt-1">{k}</dt>
            <dd className={cn('leading-relaxed', k === 'what changed' ? 'font-serif text-2xl leading-snug text-fg' : 'text-soft')}>{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-7 flex flex-wrap gap-2" aria-label="Tags">
        {stage.tags.map(t => <li key={t} className="rounded-full border border-rule px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-mute">{t}</li>)}
      </ul>
    </li>
  )
}

/** A timeline that grows a network: every year adds a layer. */
export function Evolution() {
  const [active, setActive] = useState(0)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const setters = useRef(evolution.map((_, i) => () => setActive(i)))

  return (
    <Section id="how-i-got-here" path="~/how-i-got-here" title="How I got here." intro="One question that kept getting bigger. Every year added a layer.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="sticky top-[3.4rem] z-20 -mx-5 self-start border-b border-rule bg-bg/90 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:top-28 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="flex items-center justify-between gap-6 lg:block">
            <p className="display text-[clamp(2.6rem,8vw,7.5rem)] tabular-nums text-amber" aria-hidden="true">{evolution[active].year}</p>
            <LayerNet active={active} labels={false} className="h-24 w-auto shrink-0 lg:hidden" />
            <LayerNet active={active} className="hidden lg:mt-6 lg:block lg:h-auto lg:w-full" />
          </div>
          <nav aria-label="Jump to a year" className="mt-8 hidden lg:block">
            <ol className="flex flex-wrap gap-2">
              {evolution.map((s, i) => (
                <li key={s.year}>
                  <button
                    type="button"
                    onClick={() => items.current[i]?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })}
                    aria-current={i === active ? 'step' : undefined}
                    className={cn('rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors', i === active ? 'border-amber text-amber' : 'border-rule text-mute hover:border-soft hover:text-fg')}
                  >
                    {s.year}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <ol>
          {evolution.map((s, i) => (
            <StageBlock key={s.year} stage={s} index={i} active={i === active} onEnter={setters.current[i]} register={el => { items.current[i] = el }} />
          ))}
        </ol>
      </div>
    </Section>
  )
}
