import type { ReactNode } from 'react'
import type { Project } from '../data/content'
import { CountUp } from './ui/CountUp'
import { ExternalLink } from './ui/ExternalLink'
import { Reveal } from './ui/Reveal'
import { Pipeline } from './Pipeline'

/** One project, told as a story: what it is, why it exists, how it works, what it taught. */
export function ProjectStory({ project: p, demo, pipelineExtra }: { project: Project; demo?: ReactNode; pipelineExtra?: (i: number) => ReactNode }) {
  return (
    <article id={p.id} aria-labelledby={`${p.id}-name`} className="scroll-mt-24 border-t border-rule pt-12">
      <Reveal>
        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-sm text-amber">{p.index}</span>
          <span className="label">{p.kicker}</span>
        </p>
        <h3 id={`${p.id}-name`} className="display mt-4 text-[clamp(2.8rem,8.5vw,7.25rem)]">{p.name}</h3>
        <p className="mt-6 max-w-3xl text-xl leading-relaxed text-soft sm:text-2xl">{p.oneLiner}</p>
      </Reveal>

      {p.metrics.length > 0 && (
        <Reveal delay={0.05}>
          <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-8">
            {p.metrics.map(mt => (
              <div key={mt.label} className="flex flex-col-reverse">
                <dt className="label mt-2">{mt.label}</dt>
                <dd className="display text-[clamp(3.5rem,8vw,6rem)] text-amber"><CountUp value={mt.value} prefix={mt.prefix} suffix={mt.suffix} /></dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}

      <Reveal className="mt-14">
        <Pipeline id={p.id} title={p.pipelineTitle} nodes={p.pipeline} extra={pipelineExtra} />
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        <Reveal className="self-start">
          <p className="label">why I built it</p>
          <p className="mt-4 leading-relaxed text-soft">{p.why}</p>
          <p className="label mt-10">stack</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {p.stack.map(s => <li key={s} className="rounded border border-rule px-2.5 py-1 font-mono text-[11px] text-soft">{s}</li>)}
          </ul>
          <div className="mt-10 flex flex-col items-start gap-4">
            {p.links.map(l => <ExternalLink key={l.href + l.label} href={l.href}>{l.label}</ExternalLink>)}
          </div>
        </Reveal>

        <div className="min-w-0">
          {demo && <Reveal className="mb-12">{demo}</Reveal>}
          <Reveal>
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <p className="label">what it taught me</p>
                <ul className="mt-4 space-y-4">
                  {p.learned.map(l => (
                    <li key={l} className="flex gap-3 leading-relaxed text-fg">
                      <span aria-hidden="true" className="mt-[0.6em] h-px w-4 shrink-0 bg-amber" />{l}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label">what I'd do next</p>
                <p className="mt-4 leading-relaxed text-soft">{p.next}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </article>
  )
}
