import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/ui/Section'
import { moreWork, projects } from '../data/content'

export function Projects() {
  return (
    <Section id="projects" title="Projects" i={1} first>
      <div className="space-y-4">
        {projects.map(p => <ProjectCard key={p.id} p={p} />)}
      </div>

      <h3 className="mt-10 text-sm font-medium text-mute">More work</h3>
      <ul className="mt-3 divide-y divide-line">
        {moreWork.map(w => (
          <li key={w.title} className="py-3 text-sm leading-relaxed">
            <a href={w.href} target="_blank" rel="noopener noreferrer" className="link font-medium">
              {w.title} <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <span className="text-mute"> · {w.context}</span>
            <p className="mt-0.5 text-soft">{w.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
