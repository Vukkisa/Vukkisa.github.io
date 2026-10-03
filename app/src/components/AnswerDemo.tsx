import { useState } from 'react'
import { cn } from '../lib/utils'

const CASES = {
  answer: {
    tab: 'a question the documents cover',
    q: 'Does the pillion rider also have to wear a helmet?',
    a: 'Yes. The rule on protective headgear applies to the person riding the motorcycle and to the person being carried on it.',
    src: 'source · Motor Vehicles Act, 1988 · Section 129',
  },
  refuse: {
    tab: 'a question they don\'t',
    q: 'Who will win tonight\'s cricket match?',
    a: 'I couldn\'t find anything about that in the traffic documents I was given, so I won\'t guess.',
    src: 'no supporting passage retrieved · the LLM is told to stop here',
  },
} as const

/** The two outcomes the last stage is allowed to produce. Illustrative, not live output. */
export function AnswerDemo() {
  const [k, setK] = useState<keyof typeof CASES>('answer')
  const c = CASES[k]
  return (
    <div className="mt-8 rounded-lg border border-rule bg-bg/60 p-5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Try an example question">
        {(Object.keys(CASES) as (keyof typeof CASES)[]).map(key => (
          <button
            key={key}
            type="button"
            aria-pressed={k === key}
            onClick={() => setK(key)}
            className={cn('rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors', k === key ? 'border-amber bg-amber text-bg' : 'border-rule text-mute hover:text-fg')}
          >
            {CASES[key].tab}
          </button>
        ))}
        <span className="label ml-auto text-dim">illustrative example</span>
      </div>
      <div className="mt-5 font-mono text-sm leading-relaxed" aria-live="polite">
        <p className="text-mute"><span className="text-dim">Q ›</span> {c.q}</p>
        <p className={cn('mt-3', k === 'refuse' ? 'text-coral' : 'text-fg')}><span className="text-dim">A ›</span> {c.a}</p>
        <p className="mt-3 text-[11px] text-dim">{c.src}</p>
      </div>
    </div>
  )
}
