import type { ReactNode } from 'react'
import { Section } from '../components/ui/Section'
import { certifications, education, experience, skills } from '../data/content'

function Row({ org, role, when, children }: { org: string; role: string; when: string; children?: ReactNode }) {
  return (
    <li className="py-4">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h3 className="text-[15px] font-medium text-fg">{org}</h3>
        <p className="shrink-0 font-mono text-xs tabular-nums text-mute">{when}</p>
      </div>
      <p className="text-sm text-soft">{role}</p>
      {children}
    </li>
  )
}

export function Experience() {
  return (
    <>
      <Section id="experience" title="Experience" i={2}>
        <ul className="-my-4 divide-y divide-line">
          {experience.map(e => (
            <Row key={e.org} org={e.org} role={e.role} when={e.when}>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-mute">
                {e.points.map(pt => <li key={pt} className="relative pl-3.5 before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-line-strong">{pt}</li>)}
              </ul>
            </Row>
          ))}
        </ul>
      </Section>

      <Section id="education" title="Education" i={3}>
        <ul className="-my-4 divide-y divide-line">
          {education.map(e => <Row key={e.org} org={e.org} role={e.role} when={e.when} />)}
        </ul>
        <p className="mt-5 text-sm text-mute">Certifications: {certifications.join(' · ')}</p>
      </Section>

      <Section id="skills" title="Skills" i={4}>
        <ul className="flex flex-wrap gap-1.5">
          {skills.map(s => <li key={s} className="rounded-md border border-line px-2 py-0.5 text-[13px] text-soft">{s}</li>)}
        </ul>
      </Section>
    </>
  )
}
