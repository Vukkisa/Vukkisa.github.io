import { m, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { chain } from '../../data/content'
import { cn } from '../../lib/utils'

/** Fixed rail on large screens: how far through SQL → Agents the visitor has scrolled. */
export function JourneyRail() {
  const { scrollYProgress } = useScroll()
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setIdx(Math.min(chain.length - 1, Math.floor(v * chain.length))))

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-8 top-1/2 z-40 hidden -translate-y-1/2 lg:flex lg:items-end lg:gap-3">
      <div className="relative flex flex-col gap-[18px] py-1">
        <span className="absolute bottom-1 left-[3px] top-1 w-px bg-rule" />
        <m.span style={{ scaleY: scrollYProgress }} className="absolute bottom-1 left-[3px] top-1 w-px origin-top bg-amber" />
        {chain.map((c, i) => (
          <span
            key={c.label}
            className={cn('relative size-[7px] rounded-full border transition-colors duration-300', i <= idx ? 'border-amber bg-amber' : 'border-faint bg-bg', i === idx && 'ring-4 ring-amber/15')}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute [writing-mode:vertical-rl] rotate-180">
        <span className="text-dim">{String(idx + 1).padStart(2, '0')}/{String(chain.length).padStart(2, '0')}</span>{' '}
        <span className="text-fg">{chain[idx].label}</span>
      </p>
    </div>
  )
}
