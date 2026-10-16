import type { CSSProperties } from 'react'
import { intro, site } from '../data/content'

const HUES = ['--h1', '--h2', '--h3', '--h4', '--h5']

/** The name, one span per letter, so each can take its own colour on hover (see .ltr in index.css). */
function Name() {
  let i = 0
  return (
    <h1 className="font-display text-[clamp(3.4rem,14.5vw,10.5rem)] font-semibold leading-[.86] tracking-[-.045em]">
      <span className="sr-only">{site.name}</span>
      <span aria-hidden="true">
        {site.name.split(' ').map(word => (
          <span key={word} className="block whitespace-nowrap">
            {[...word].map(ch => {
              const k = i++
              return <span key={k} className="ltr ltr-in" style={{ '--h': `var(${HUES[k % HUES.length]})`, '--i': k } as CSSProperties}>{ch}</span>
            })}
          </span>
        ))}
      </span>
    </h1>
  )
}

const LINKS = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Résumé', href: site.resume },
]

export function Hero() {
  const [lead, ...clauses] = intro.tagline
  return (
    <section id="top" aria-label="Introduction" className="relative">
      {/* Full-bleed glow: wider than the content column so it never shows an edge. */}
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute -top-24 left-1/2 h-[38rem] w-screen -translate-x-1/2" />
      <div className="relative pb-6 pt-10 sm:pt-16 lg:pt-20">
        <p className="eyebrow rise flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2 text-fg">
            <span aria-hidden="true" className="pulse size-2 rounded-full bg-live" />
            {intro.now}
          </span>
          <span aria-hidden="true">·</span>
          <span>{site.location}</span>
        </p>

        <div className="mt-8 flex items-end justify-between gap-6">
          <Name />
          <a href="#about" className="avatar group relative mb-1 block shrink-0 sm:mb-2" aria-label="About me">
            <img
              src={`${import.meta.env.BASE_URL}images/jayanth-320.webp`}
              width={176}
              height={176}
              alt=""
              fetchPriority="high"
              decoding="async"
              className="size-20 rounded-(--r) object-cover sm:size-28 lg:size-44"
            />
            <span aria-hidden="true" className="smile absolute -right-3 -top-3 grid size-10 place-items-center rounded-full bg-accent text-xl text-accent-ink">☺︎</span>
          </a>
        </div>

        <p className="rise mt-10 max-w-3xl font-display text-[clamp(1.6rem,3.6vw,2.6rem)] font-medium leading-[1.12] tracking-tight" style={{ '--d': '250ms' } as CSSProperties}>
          {lead} <span className="text-mute">{clauses[0]}</span> <span className="text-mute">{clauses[1]}</span>{' '}
          <span className="text-accent">{clauses[2]}</span>
        </p>

        <div className="rise mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end" style={{ '--d': '380ms' } as CSSProperties}>
          <p className="max-w-xl text-[15px] leading-relaxed text-soft sm:text-base">{intro.lines[0]}</p>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <a href="#work" className="chip inline-flex items-center gap-2 bg-fg px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85">
                See the work <span aria-hidden="true">↓</span>
              </a>
              <a href="#journey" className="chip group inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
                <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-0.5">▶</span> Start the journey
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {LINKS.map(l => {
                const external = l.href.startsWith('http')
                return (
                  <li key={l.label}>
                    <a href={l.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="link">
                      {l.label}{external && <><span aria-hidden="true" className="nudge text-mute"> ↗</span><span className="sr-only"> (opens in a new tab)</span></>}
                    </a>
                  </li>
                )
              })}
              <li><a href={`mailto:${site.email}`} className="link">Email</a></li>
            </ul>
          </div>
        </div>

        <a href="#work" aria-hidden="true" tabIndex={-1} className="mt-12 hidden items-center gap-3 font-mono text-[11px] text-mute sm:inline-flex">
          <span className="relative block h-10 w-px overflow-hidden bg-line"><span className="cue-line absolute inset-0 bg-accent" /></span>
          scroll
        </a>
      </div>
    </section>
  )
}
