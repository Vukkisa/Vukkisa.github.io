import { Reveal } from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'
import { certifications, experience, skills } from '../data/content'

export function Experience() {
  return (
    <Section id="experience" index="03" kicker="Experience" title="Where I’ve worked and studied.">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
        <ol>
          {experience.map(e => (
            <li key={e.role + e.org} className="border-t border-rule py-6 first:border-t-rule-strong">
              <Reveal>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="text-lg font-medium text-ink">
                    {e.role} <span className="font-normal text-ink-2">· {e.org}</span>
                  </h3>
                  <p className="shrink-0 font-mono text-xs text-mute">{e.when}</p>
                </div>
                <ul className="mt-3 space-y-2">
                  {e.points.map(p => (
                    <li key={p} className="relative pl-4 text-[15px] leading-relaxed text-ink-2">
                      <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-2 bg-rule-strong" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="space-y-10 self-start lg:sticky lg:top-24">
          <div>
            <h3 className="label">Tools I use</h3>
            <dl className="mt-4 space-y-4">
              {skills.map(s => (
                <div key={s.group}>
                  <dt className="text-sm font-medium text-ink">{s.group}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-2">{s.items.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="label">Certifications</h3>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
              {certifications.map(c => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
