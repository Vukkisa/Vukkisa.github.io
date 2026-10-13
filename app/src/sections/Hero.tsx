import { m } from 'framer-motion'
import { hero, site } from '../data/content'

const EASE = [0.25, 1, 0.5, 1] as const
const rise = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: EASE, delay } })

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div>
          <m.p className="label" {...rise(0)}>{hero.kicker}</m.p>
          <h1 id="hero-title" className="display mt-6 text-[clamp(2.9rem,8vw,6.25rem)]">
            <m.span className="block" {...rise(0.05)}>{hero.lineOne}</m.span>
            <m.span className="mt-1 block text-ink-2" {...rise(0.25)}>
              Then I wanted to know what the data <em className="text-accent">could do.</em>
            </m.span>
          </h1>
          <m.p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2" {...rise(0.4)}>{hero.intro}</m.p>
          <m.div className="mt-9 flex flex-wrap items-center gap-3" {...rise(0.5)}>
            <a href="#work" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent">
              See my work
            </a>
            <a href={site.resume} className="rounded-full border border-rule-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent">
              Résumé <span className="text-mute">(PDF)</span>
            </a>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="px-2 py-2.5 text-sm text-ink-2 underline decoration-rule-strong underline-offset-4 hover:text-accent hover:decoration-accent">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="px-2 py-2.5 text-sm text-ink-2 underline decoration-rule-strong underline-offset-4 hover:text-accent hover:decoration-accent">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </m.div>
        </div>

        <m.aside aria-label="At a glance" className="self-end" {...rise(0.35)}>
          <picture>
            <source type="image/webp" srcSet="/images/jayanth-320.webp 320w, /images/jayanth-640.webp 640w" sizes="(min-width: 1024px) 288px, 160px" />
            <img
              src="/assests/jayanth.jpg"
              width={640}
              height={800}
              decoding="async"
              fetchPriority="high"
              alt="Jayanth Vukkisa, smiling, on a forest road in the hills"
              className="aspect-[4/5] w-40 rounded-md object-cover lg:w-full"
            />
          </picture>
          <dl className="mt-6 divide-y divide-rule border-y border-rule">
            {hero.now.map(n => (
              <div key={n.label} className="py-3">
                <dt className="label">{n.label}</dt>
                <dd className="mt-1 text-sm leading-snug text-ink">{n.value}</dd>
                <dd className="mt-0.5 font-mono text-xs text-mute">{n.detail}</dd>
              </div>
            ))}
          </dl>
        </m.aside>
      </div>
    </section>
  )
}
