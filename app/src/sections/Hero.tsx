import type { CSSProperties } from 'react'
import { SignalFigure } from '../components/SignalFigure'
import { intro, site } from '../data/content'

/** The name, one span per letter, so each can take the accent colour on hover (see .ltr in index.css). */
function Name() {
  let i = 0
  return (
    <span aria-hidden="true" className="t-display block">
      {site.name.split(' ').map(word => (
        <span key={word} className="block whitespace-nowrap">
          {[...word].map(ch => {
            const k = i++
            return <span key={k} className="ltr ltr-in" style={{ '--i': k } as CSSProperties}>{ch}</span>
          })}
        </span>
      ))}
    </span>
  )
}

const LINKS = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Résumé', href: site.resume },
  { label: 'Email', href: `mailto:${site.email}` },
]

/**
 * First screen: what I do (focus line), who I am (name), the one-line statement, a short factual
 * summary, the two main ways in (projects and the Lab), and one technical visual. Everything is
 * readable without animation; the entrance motion only runs with prefers-reduced-motion: no-preference.
 */
export function Hero() {
  const [lead, ...clauses] = intro.tagline
  return (
    <section id="top" aria-labelledby="hero-title" data-loop className="relative pb-12 pt-8 sm:pt-12 lg:pb-16 lg:pt-10">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <div className="rise flex items-center gap-4">
            <a href="#about" className="avatar group relative block shrink-0" aria-label="About me">
              <img
                src={`${import.meta.env.BASE_URL}images/jayanth-320.webp`}
                width={64}
                height={64}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="size-14 rounded-(--r-sm) object-cover sm:size-16"
              />
              <span aria-hidden="true" className="smile absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-accent text-sm text-accent-ink">☺︎</span>
            </a>
            <div className="min-w-0">
              <p className="t-kicker text-fg">{intro.focus.join(' · ')}</p>
              <p className="mt-1 text-sm text-mute">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-live align-middle" aria-hidden="true" />
                {intro.now} · {site.location}
              </p>
            </div>
          </div>

          <h1 id="hero-title" className="mt-7 lg:mt-8">
            <span className="sr-only">{site.name}: </span>
            <Name />
            <span className="rise t-headline mt-5 block max-w-[36rem]" style={{ '--d': '220ms' } as CSSProperties}>
              {lead} <span className="text-mute">{clauses[0]}</span> <span className="text-mute">{clauses[1]}</span>{' '}
              <span className="text-accent">{clauses[2]}</span>
            </span>
          </h1>

          <p className="rise t-lead mt-5 max-w-[36rem]" style={{ '--d': '320ms' } as CSSProperties}>{intro.summary}</p>

          <div className="rise mt-7 flex flex-wrap items-center gap-2.5" style={{ '--d': '400ms' } as CSSProperties}>
            <a href="#work" className="btn btn-primary">
              View projects <span aria-hidden="true" className="btn-arrow">→</span>
            </a>
            <a href="#lab" className="btn btn-secondary">
              Open the Lab <span aria-hidden="true" className="btn-arrow">→</span>
            </a>
            <a href="#journey" className="link text-sm text-soft sm:ml-1">or start the journey</a>
          </div>

          <ul className="rise mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ '--d': '460ms' } as CSSProperties} aria-label="Elsewhere">
            {LINKS.map(l => {
              const external = l.href.startsWith('http')
              return (
                <li key={l.label}>
                  <a href={l.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="link text-soft">
                    {l.label}{external && <><span aria-hidden="true" className="nudge text-mute"> ↗</span><span className="sr-only"> (opens in a new tab)</span></>}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rise max-w-[36rem] lg:max-w-none" style={{ '--d': '300ms' } as CSSProperties}>
          <SignalFigure />
        </div>
      </div>
    </section>
  )
}
