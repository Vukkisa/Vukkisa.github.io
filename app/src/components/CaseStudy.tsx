import type { Project } from '../data/content'
import { cn } from '../lib/utils'

/**
 * A project's case study as a native disclosure (<details>): how it works, my part, what has been
 * evaluated, its limitations, and where to find the code or demo. Works without JavaScript, by
 * keyboard, and can be opened by link: #<project-id>-case (see useCaseStudyLinks). The parts are
 * plain blocks under h4 headings, not labelled sections, so four case studies don't add sixteen
 * look-alike landmarks.
 */
export function CaseStudy({ p }: { p: Project }) {
  const c = p.caseStudy
  const h = 'font-mono text-[0.6875rem] uppercase tracking-wider text-mute'
  return (
    <details id={`${p.id}-case`} className="case surface md:order-3 md:col-span-12">
      <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-(--r) px-5 py-4 transition-colors hover:bg-chip/60">
        <span>
          <span className="block font-display text-lg font-semibold tracking-tight">Case study<span className="sr-only">: {p.title}</span></span>
          <span className="block text-sm text-mute">How it works · my part · evaluation · limitations</span>
        </span>
        <span aria-hidden="true" className="case-mark grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-lg leading-none text-soft">+</span>
      </summary>

      <div className="case-body grid gap-10 border-t border-line px-5 py-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12">
        <div>
          <h4 id={`${p.id}-case-how`} className={h}>How it works</h4>
          <ol className="mt-4 space-y-4">
            {c.steps.map((s, i) => (
              <li key={s.name} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span aria-hidden="true" className="font-mono text-xs leading-6 text-accent">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-[0.9375rem] leading-relaxed text-soft">
                  <span className="font-medium text-fg">{s.name}.</span> {s.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-8">
          <div>
            <h4 id={`${p.id}-case-mine`} className={h}>My part</h4>
            <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-fg">
              {c.mine.map(m => <li key={m}>{m}</li>)}
            </ul>
            {c.team && <p className="mt-2 text-sm leading-relaxed text-mute">{c.team}</p>}
          </div>

          <div>
            <h4 id={`${p.id}-case-eval`} className={h}>Evaluation so far</h4>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-soft">{c.evaluation}</p>
          </div>

          <div>
            <h4 id={`${p.id}-case-limits`} className={h}>Limitations</h4>
            <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-soft">
              {c.limitations.map(l => (
                <li key={l} className="relative pl-4 before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-line-strong">{l}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 id={`${p.id}-case-links`} className={h}>Code and demo</h4>
            <div className={cn('mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm', !p.links.length && 'text-mute')}>
              {p.links.map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link font-medium">
                  {l.label}<span aria-hidden="true" className="nudge text-mute"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
              {p.privateNote && <p>{p.privateNote}</p>}
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}
