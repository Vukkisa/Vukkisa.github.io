import { m } from 'framer-motion'
import { Section } from '../components/ui/Section'
import { journey } from '../data/content'
import { cn } from '../lib/utils'

const EASE = [0.25, 1, 0.5, 1] as const

export function Journey() {
  return (
    <Section
      id="journey"
      index="02"
      kicker="Journey"
      title="From queries to models."
      intro="Each stage built on the one before it. Every stage links to the work that shows it, and the last one is where I’m heading next."
      className="bg-surface"
    >
      <ol>
        {journey.map((j, i) => {
          const next = j.evidence === null
          return (
            <m.li
              key={j.stage}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, ease: EASE }}
              className="grid gap-x-8 gap-y-1 border-t border-rule py-5 sm:grid-cols-[3rem_minmax(0,14rem)_minmax(0,1fr)_9rem] sm:items-baseline"
            >
              <span className={cn('font-mono text-sm', next ? 'text-mute' : 'text-accent')}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={cn('display text-3xl', next && 'italic text-ink-2')}>{j.stage}</h3>
              <div>
                <p className="text-[15px] leading-relaxed text-ink-2">{j.note}</p>
                <p className="mt-1 font-mono text-xs text-mute">{[j.when, j.where].filter(Boolean).join(' · ')}</p>
              </div>
              {j.evidence && (
                <a href={j.evidence.href} className="mt-2 text-sm text-ink underline decoration-rule-strong underline-offset-4 hover:text-accent hover:decoration-accent sm:mt-0 sm:justify-self-end">
                  {j.evidence.label} <span aria-hidden="true" className="text-accent">→</span>
                </a>
              )}
            </m.li>
          )
        })}
      </ol>
    </Section>
  )
}
