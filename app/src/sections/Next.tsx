import { Reveal } from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'
import { nextUp } from '../data/content'

export function Next() {
  return (
    <Section id="next" path="~/next" title="What's next?">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <Reveal>
          {nextUp.statement.map(p => <p key={p} className="mb-6 font-serif text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.2]">{p}</p>)}
        </Reveal>
        <Reveal delay={0.08}>
          <p className="label flex items-center gap-2">
            <span aria-hidden="true" className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-mint/60 motion-reduce:animate-none" />
              <span className="relative size-2 rounded-full bg-mint" />
            </span>
            open to opportunities · pointing at
          </p>
          <ol className="mt-5 border-t border-rule">
            {nextUp.directions.map((d, i) => (
              <li key={d} className="flex items-baseline gap-5 border-b border-rule py-4">
                <span className="font-mono text-[11px] text-dim">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xl">{d}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  )
}
