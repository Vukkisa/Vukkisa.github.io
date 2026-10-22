import { useEffect, useRef, useState } from 'react'
import { Landscape } from '../components/Landscape'
import { SectionHead } from '../components/SectionHead'
import { chapters } from '../data/content'
import { cn } from '../lib/utils'

const STATIONS = ['Data', 'Processing', 'Learning', 'Retrieval', 'Applications']

/** Where the thread is: one chip per station, the current one named (on phones only that one). */
function Stations({ stage, className }: { stage: number; className?: string }) {
  return (
    <ol aria-label="Stations" className={cn('flex flex-wrap gap-1.5 font-mono text-[0.6875rem]', className)}>
      {STATIONS.map((s, i) => {
        const reached = stage >= i + 1
        return (
          <li key={s} aria-current={stage === i + 1 ? 'step' : undefined} className={cn('chip border px-2 py-1 transition-colors duration-500', stage === i + 1 ? 'border-accent bg-accent text-accent-ink' : reached ? 'border-accent/50 text-fg' : 'border-line text-mute')}>
            {String(i + 1).padStart(2, '0')}<span className={cn(stage !== i + 1 && 'max-sm:sr-only')}> {s}</span>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * The career, year by year, beside a landscape that follows along: as each chapter reaches the
 * middle of the screen, the thread runs on to that chapter's station. Without JavaScript-driven
 * scrolling (or with reduced motion) it still works; the thread just jumps instead of gliding.
 *
 * On wide screens the illustration stays pinned beside the chapters. On phones it would cover half
 * the screen, so it scrolls past once and only the slim row of stations stays pinned.
 */
export function Journey() {
  const [current, setCurrent] = useState(0)
  const items = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setCurrent(chapters.length - 1); return }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i)) }),
      { rootMargin: '-45% 0px -50% 0px' },   // a band just above the middle of the screen
    )
    items.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const stage = chapters[current].station

  return (
    <section id="journey" aria-labelledby="journey-title" className="sec">
      <SectionHead id="journey-title" n="02" glyph="↝" title="Journey" note="From SQL tables to systems that answer back." />

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <figure data-loop>
            <div className="dot-grid mx-auto max-w-md overflow-hidden rounded-(--r) border border-line bg-card/40 px-2 sm:px-4 lg:max-w-none">
              <Landscape stage={stage} />
            </div>
            <Stations stage={stage} className="mt-3 max-lg:hidden" />
            <figcaption className="mt-2 text-xs text-mute max-lg:text-center">Illustration: a metaphor for the path, not a system diagram.</figcaption>
          </figure>
        </div>

        {/* Phones: just the stations stay in view while the chapters scroll past. */}
        <div className="sticky top-(--header-h) z-10 -mx-5 mt-6 border-b border-line bg-bg/95 px-5 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
          <Stations stage={stage} />
        </div>

        <ol className="relative mt-6 border-l border-line lg:mt-0">
          {chapters.map((c, i) => (
            <li
              key={c.year + c.title}
              ref={el => { items.current[i] = el }}
              data-i={i}
              className="relative pb-12 pl-7 last:pb-0 sm:pl-9"
            >
              <span aria-hidden="true" className={cn('absolute -left-[5px] top-1.5 size-[9px] rounded-full border transition-colors duration-500', i <= current ? 'border-accent bg-accent' : 'border-line-strong bg-bg')} />
              <p className="eyebrow flex flex-wrap items-center gap-x-2">
                <span className="text-fg">{c.year}</span>
                <span aria-hidden="true">·</span>
                <span className={c.kind === 'Direction' ? 'text-accent' : ''}>{c.kind === 'Direction' ? '▸ next, not done yet' : c.kind}</span>
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{c.title}</h3>
              <p className="mt-1 text-sm text-mute">{c.org}</p>
              <ul className="mt-3 space-y-1.5 text-[0.9375rem] leading-relaxed text-soft">
                {c.points.map(pt => <li key={pt}>{pt}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
