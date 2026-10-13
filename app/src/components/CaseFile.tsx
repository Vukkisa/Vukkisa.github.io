import type { CaseFile as Case } from '../data/content'
import { cn } from '../lib/utils'
import { Flow } from './Flow'
import { ExternalLink } from './ui/ExternalLink'
import { Reveal } from './ui/Reveal'

const TONE = {
  done: 'bg-surface text-ink-2 border-rule-strong',
  progress: 'bg-progress-soft text-progress border-progress/40',
  live: 'bg-live-soft text-live border-live/40',
} as const

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="label">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map(t => (
          <li key={t} className="relative pl-4 text-[15px] leading-relaxed text-ink-2">
            <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-2 bg-rule-strong" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** One project, laid out the same way every time: problem, what I did, decisions, limits, evidence. */
export function CaseFile({ c, index }: { c: Case; index: number }) {
  const headingId = `${c.id}-title`
  return (
    <article id={c.id} aria-labelledby={headingId} className="scroll-mt-24 border-t border-rule-strong pt-8 sm:pt-10">
      <Reveal>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-sm text-accent">{String(index + 1).padStart(2, '0')}</span>
          <span className="label">{c.context}</span>
          <span className="label">{c.date}</span>
          <span className={cn('rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em]', TONE[c.status.tone])}>
            {c.status.label}
          </span>
        </div>
        <h3 id={headingId} className="display mt-4 text-[clamp(2rem,4.5vw,3.25rem)]">{c.title}</h3>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">{c.summary}</p>
      </Reveal>

      <Reveal className="mt-8">
        <Flow steps={c.flow} label={`${c.title}: pipeline steps`} note={c.flowNote} />
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
        <Reveal className="space-y-8">
          <div>
            <h4 className="label">The problem</h4>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{c.problem}</p>
          </div>
          {c.decisions && <Block title="Key decisions" items={c.decisions} />}
        </Reveal>
        <Reveal className="space-y-8">
          <Block title={c.did.heading} items={c.did.points} />
          <Block title="Limits & status" items={c.limits} />
        </Reveal>
      </div>

      <Reveal className="mt-10 flex flex-col gap-5 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
        <ul aria-label="Tools used" className="flex flex-wrap gap-1.5">
          {c.stack.map(s => (
            <li key={s} className="rounded border border-rule px-2 py-0.5 font-mono text-[11px] text-ink-2">{s}</li>
          ))}
        </ul>
        <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
          {c.links.map(l => <ExternalLink key={l.href} href={l.href} note={l.note}>{l.label}</ExternalLink>)}
          {c.privateNote && <p className="text-sm text-mute">{c.privateNote}</p>}
        </div>
      </Reveal>
    </article>
  )
}
