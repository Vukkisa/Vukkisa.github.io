import { ProjectCard } from '../components/ProjectCard'
import { SectionHead } from '../components/SectionHead'
import { moreWork, projects } from '../data/content'

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="sec">
      <SectionHead id="work-title" n="01" glyph="▶" title="Selected work" count={projects.length} note="Problem, what I built, and the evidence, without inflated numbers." />

      <div className="mt-12 space-y-20 sm:space-y-28">
        {projects.map((p, i) => (
          <div key={p.id} data-reveal>
            <ProjectCard p={p} index={i} />
          </div>
        ))}
      </div>

      <div data-reveal className="mt-20 sm:mt-24">
        <h3 className="eyebrow">⌘ Also, smaller things</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {moreWork.map(w => (
            <li key={w.title}>
              <a href={w.href} target="_blank" rel="noopener noreferrer" className="pad group block h-full rounded-(--r) border border-line bg-card transition-colors hover:border-line-strong">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-semibold tracking-tight group-hover:text-accent">{w.title}</span>
                  <span aria-hidden="true" className="text-mute transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-soft">{w.body}</span>
                <span className="mt-3 block font-mono text-[11px] text-mute">{w.context} · notebook</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
