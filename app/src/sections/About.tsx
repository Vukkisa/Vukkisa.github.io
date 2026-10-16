import { SectionHead } from '../components/SectionHead'
import { certifications, education, now, skillGroups } from '../data/content'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="sec">
      <SectionHead id="about-title" n="04" glyph="☺︎" title="About" />

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-5">
          <p className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-[1.7rem]">
            Two and a half years of SQL and billing data taught me where real data breaks. Now I build the AI that has to live with it.
          </p>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {now.map(n => (
              <div key={n.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-3 text-[15px]">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-accent">{n.label}</dt>
                <dd className="text-soft">{n.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-reveal className="space-y-10 lg:col-span-6 lg:col-start-7">
          <div>
            <h3 className="eyebrow">Education</h3>
            <ul className="mt-3 space-y-3">
              {education.map(e => (
                <li key={e.org} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span>
                    <span className="block font-medium">{e.org}</span>
                    <span className="text-sm text-soft">{e.role}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-mute">{e.when}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-mute">Certifications: {certifications.join(' · ')}</p>
          </div>

          <div>
            <h3 className="eyebrow">Stack</h3>
            <div className="mt-3 space-y-3">
              {skillGroups.map(g => (
                <div key={g.name} className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-baseline">
                  <p className="text-sm text-mute">{g.name}</p>
                  <ul aria-label={g.name} className="flex flex-wrap gap-1.5">
                    {g.items.map(s => <li key={s} className="chip border border-line bg-card px-2 py-0.5 font-mono text-xs text-soft">{s}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
