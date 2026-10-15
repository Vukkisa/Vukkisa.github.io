import type { Project } from '../data/content'
import { cn } from '../lib/utils'
import { RagFlow } from './RagFlow'

const TONE = {
  done: 'bg-chip text-soft',
  progress: 'bg-progress-soft text-progress',
  live: 'bg-live-soft text-live',
} as const

/** One recruiter-friendly card: problem, what I built, evidence, tools, links. Same shape every time. */
export function ProjectCard({ p }: { p: Project }) {
  const headingId = `${p.id}-title`
  return (
    <article id={p.id} aria-labelledby={headingId} className="card scroll-mt-8 rounded-xl border border-line bg-card p-5 sm:p-6">
      <h3 id={headingId} className="font-semibold tracking-tight text-fg">
        {p.title}
        <span className="font-normal text-mute"> · {p.subtitle}</span>
      </h3>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mute">
        <span className={cn('rounded-full px-2 py-0.5 font-medium', TONE[p.status.tone])}>{p.status.label}</span>
        <span>{p.context}</span>
      </p>

      <dl className="mt-4 space-y-3 text-sm leading-relaxed">
        {([['Problem', p.problem], ['What I built', p.built], ['Evidence', p.evidence]] as const).map(([k, v]) => (
          <div key={k} className="sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-mute sm:pt-0.5">{k}</dt>
            <dd className="mt-0.5 text-soft sm:mt-0">{v}</dd>
          </div>
        ))}
      </dl>

      {p.explainer === 'rag-flow' && <RagFlow />}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ul aria-label="Tools used" className="flex flex-wrap gap-1.5">
          {p.tools.map(t => <li key={t} className="rounded-md bg-chip px-2 py-0.5 font-mono text-[11px] text-soft">{t}</li>)}
        </ul>
        <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-sm">
          {p.links.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link">
              {l.label} <span aria-hidden="true" className="nudge">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
              {l.note && <span className="ml-1 text-xs text-mute no-underline">({l.note})</span>}
            </a>
          ))}
          {p.privateNote && <p className="text-xs text-mute">{p.privateNote}</p>}
        </div>
      </div>
    </article>
  )
}
