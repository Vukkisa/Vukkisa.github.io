import type { Project } from '../data/content'
import { cn } from '../lib/utils'
import { CaseStudy } from './CaseStudy'
import { ProjectVisual, VISUAL_TITLES } from './ProjectVisual'

const TONE = {
  done: 'border-line-strong text-soft',
  progress: 'border-progress/40 bg-progress-soft text-progress',
  live: 'border-live/40 bg-live-soft text-live',
} as const

/**
 * One project as an editorial row: a large illustration on one side, the case on the other
 * (problem, what I built, evidence, tools, links), and the full case study underneath. Rows
 * alternate sides on wide screens. The AI projects show a drawn diagram of how they work; the
 * others a static cover. Both are illustrations, labelled as such, never screenshots.
 */
export function ProjectCard({ p, index }: { p: Project; index: number }) {
  const headingId = `${p.id}-title`
  const flip = index % 2 === 1
  const fig = String(index + 1).padStart(2, '0')
  return (
    <article id={p.id} aria-labelledby={headingId} className="project grid gap-6 md:grid-cols-12 md:gap-10">
      <div className={cn('md:col-span-6 lg:col-span-7', flip && 'md:order-2')}>
        <div className="cover relative overflow-hidden rounded-(--r) border border-line bg-card" data-loop={p.visual ? '' : undefined}>
          {p.visual ? (
            <>
              <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
                <p className="t-kicker text-fg">fig. {fig} · {VISUAL_TITLES[p.visual]}</p>
                <p className="t-kicker">Illustration</p>
              </div>
              <ProjectVisual kind={p.visual} />
            </>
          ) : (
            <>
              <img src={`${import.meta.env.BASE_URL}images/projects/${p.cover}-dark.svg`} alt="" width={1200} height={900} loading="lazy" decoding="async" className="hidden aspect-[4/3] w-full object-cover dark:block" />
              <img src={`${import.meta.env.BASE_URL}images/projects/${p.cover}.svg`} alt="" width={1200} height={900} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover dark:hidden" />
              <span className="absolute left-3 top-3 rounded-full bg-bg/80 px-2 py-0.5 font-mono text-[0.625rem] text-mute backdrop-blur-sm">fig. {fig} · illustration</span>
            </>
          )}
        </div>
      </div>

      <div className={cn('flex flex-col md:col-span-6 lg:col-span-5', flip && 'md:order-1')}>
        <p className="eyebrow flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full border px-2 py-0.5 text-[0.6875rem]', TONE[p.status.tone])}>{p.status.label}</span>
          <span>{p.context}</span>
        </p>
        <h3 id={headingId} className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{p.title}</h3>
        <p className="mt-1 text-[0.9375rem] text-mute">{p.subtitle}</p>

        <dl className="mt-5 space-y-3.5 text-[0.9375rem] leading-relaxed">
          {([['Problem', p.problem], ['What I built', p.built], ['Evidence', p.evidence]] as const).map(([k, v]) => (
            <div key={k}>
              <dt className={cn('font-mono text-[0.6875rem] uppercase tracking-wider', k === 'What I built' ? 'text-accent' : 'text-mute')}>{k}</dt>
              <dd className="mt-0.5 text-soft">{v}</dd>
            </div>
          ))}
        </dl>

        <ul aria-label="Tools used" className="mt-5 flex flex-wrap gap-1.5">
          {p.tools.map(t => <li key={t} className="chip border border-line px-2 py-0.5 font-mono text-[0.6875rem] text-soft">{t}</li>)}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {p.links.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link font-medium">
              {l.label}<span aria-hidden="true" className="nudge text-mute"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
              {l.note && <span className="ml-1 text-xs font-normal text-mute">({l.note})</span>}
            </a>
          ))}
          {p.lab && (
            <a href={p.lab.href} className="link font-medium">
              <span aria-hidden="true" className="text-accent">▶ </span>{p.lab.label}<span className="sr-only"> (in the Lab, on this page)</span>
            </a>
          )}
          {p.privateNote && <p className="text-[0.8125rem] text-mute">{p.privateNote}</p>}
        </div>
      </div>

      <CaseStudy p={p} />
    </article>
  )
}
