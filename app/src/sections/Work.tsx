import { CaseFile } from '../components/CaseFile'
import { ExternalLink } from '../components/ui/ExternalLink'
import { Reveal } from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'
import { moreWork, work } from '../data/content'

export function Work() {
  return (
    <Section
      id="work"
      index="01"
      kicker="Selected work"
      title="Five projects, shown as they are."
      intro="Each one says where it came from (internship, coursework or team project), what I did, the decisions behind it, and what it can’t do yet. Internship work is described without code or data."
    >
      <div className="space-y-20 sm:space-y-28">
        {work.map((c, i) => <CaseFile key={c.id} c={c} index={i} />)}
      </div>

      <div id="more-work" className="mt-24 scroll-mt-24 sm:mt-32">
        <Reveal>
          <h3 className="label">More work</h3>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {moreWork.map(w => (
            <Reveal key={w.title} className="flex flex-col rounded-lg border border-rule bg-surface p-6">
              <p className="label">{w.context}</p>
              <h4 className="display mt-3 text-3xl">{w.title}</h4>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">{w.body}</p>
              <ul aria-label="Tools used" className="mt-5 flex flex-wrap gap-1.5">
                {w.stack.map(s => <li key={s} className="rounded border border-rule px-2 py-0.5 font-mono text-[11px] text-ink-2">{s}</li>)}
              </ul>
              <ExternalLink href={w.href} className="mt-5">Repository</ExternalLink>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
