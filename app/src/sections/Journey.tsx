import { useEffect, useRef, useState } from 'react'
import { Landscape } from '../components/Landscape'
import { SectionHead } from '../components/SectionHead'
import { chapters } from '../data/content'
import { cn } from '../lib/utils'

const STATIONS = ['Data', 'Processing', 'Learning', 'Retrieval', 'Applications']

/**
 * The career, year by year, beside a landscape that follows along: as each chapter reaches the
 * middle of the screen, the thread runs on to that chapter's station. Without JavaScript-driven
 * scrolling (or with reduced motion) it still works; the thread just jumps instead of gliding.
 */
export function Journey() {
  const [current, setCurrent] = useState(0)
  const items = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setCurrent(chapters.length - 1); return }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i)) }),
      // On phones the pinned illustration covers the top of the screen, so the band sits lower.
      { rootMargin: window.matchMedia('(min-width: 64rem)').matches ? '-45% 0px -50% 0px' : '-62% 0px -33% 0px' },
    )
    items.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const stage = chapters[current].station

  return (
    <section id="journey" aria-labelledby="journey-title" className="sec">
      <SectionHead id="journey-title" n="02" glyph="↝" title="Journey" note="From SQL tables to systems that answer back." />

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        {/* The illustration stays in view while the chapters scroll past (on phones it pins under the top bar). */}
        <div className="sticky top-14 z-10 -mx-5 bg-bg/90 px-5 pb-3 pt-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <figure>
            <div className="dot-grid overflow-hidden rounded-(--r) border border-line bg-card/40 px-2 sm:px-4">
              <Landscape stage={stage} />
            </div>
            <ol aria-label="Stations" className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px]">
              {STATIONS.map((s, i) => {
                const reached = stage >= i + 1
                return (
                  <li key={s} aria-current={stage === i + 1 ? 'step' : undefined} className={cn('chip border px-2 py-1 transition-colors duration-500', stage === i + 1 ? 'border-accent bg-accent text-accent-ink' : reached ? 'border-accent/50 text-fg' : 'border-line text-mute')}>
                    {String(i + 1).padStart(2, '0')}<span className={cn(stage !== i + 1 && 'max-sm:sr-only')}> {s}</span>
                  </li>
                )
              })}
            </ol>
            <figcaption className="mt-2 hidden text-xs text-mute lg:block">Illustration: a metaphor for the path, not a system diagram.</figcaption>
          </figure>
        </div>

        <ol className="relative mt-8 border-l border-line lg:mt-0">
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
              <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-soft">
                {c.points.map(pt => <li key={pt}>{pt}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
