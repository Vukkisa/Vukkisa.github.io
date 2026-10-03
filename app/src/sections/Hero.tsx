import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Magnetic } from '../components/ui/Magnetic'
import { chain, site } from '../data/content'
import { cn, scrollToId } from '../lib/utils'

const EASE = [0.25, 1, 0.5, 1] as const
/** The four words under the headline, and the chain stage at which each one lights up. */
const WORDS = [
  { label: 'Software', from: 0 },
  { label: 'Data', from: 2 },
  { label: 'Machine Learning', from: 3 },
  { label: 'GenAI', from: 6 },
]
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The opening. The section is tall and its content sticky, so scrolling "runs" the terminal line
 * at the bottom through every stage of the journey before the story starts.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [stage, setStage] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    setStage(Math.min(chain.length - 1, Math.max(0, Math.floor(((v - 0.04) / 0.86) * chain.length))))
  })
  const underline = useTransform(scrollYProgress, [0, 0.9], [0, 1])
  const dim = useTransform(scrollYProgress, [0.88, 1], [1, 0.6])
  const current = reduce ? chain.length - 1 : stage

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className={cn('relative', !reduce && 'h-[250svh]')}>
      <div className="sticky top-0 flex min-h-svh flex-col justify-between gap-10 px-5 pb-7 pt-24 sm:px-8 lg:pl-32 lg:pr-12">
        <m.p className="label mx-auto w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          {site.name} <span className="text-dim">—</span> {site.location}
        </m.p>

        <m.div style={{ opacity: reduce ? 1 : dim }} className="mx-auto w-full max-w-6xl">
          <h1 id="hero-title" className="display text-[clamp(3.1rem,10.5vw,9.75rem)]">
            <m.span className="block" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
              I started with <span className="font-mono text-[0.7em] tracking-[-0.03em] text-amber">SQL</span>.
            </m.span>
            <m.span className="mt-2 block text-soft" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}>
              Then I wanted to know what the data{' '}
              <em className="relative inline-block italic text-fg">
                could do.
                <m.span aria-hidden="true" style={{ scaleX: reduce ? 1 : underline }} className="absolute -bottom-[0.04em] left-0 h-[0.05em] w-full origin-left bg-amber" />
              </em>
            </m.span>
          </h1>

          <m.p className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}>
            {WORDS.map((w, i) => (
              <span key={w.label} className="flex items-center gap-3">
                <span className={cn('transition-colors duration-500', current >= w.from ? 'text-fg' : 'text-dim')}>{w.label}</span>
                {i < WORDS.length - 1 && <span aria-hidden="true" className={cn('transition-colors duration-500', current >= WORDS[i + 1].from ? 'text-amber' : 'text-dim')}>→</span>}
              </span>
            ))}
          </m.p>
        </m.div>

        <m.div className="mx-auto w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}>
          <div className="flex flex-col gap-5 border-t border-rule pt-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0" aria-hidden="true">
              <p className="label">
                <span className="text-amber">[{pad(current + 1)}/{pad(chain.length)}]</span> {chain[current].label}
                {!reduce && current === 0 && <span className="ml-3 text-dim">scroll to run it</span>}
              </p>
              <div className="mt-2 h-6 overflow-hidden font-mono text-[13px] sm:text-sm">
                <AnimatePresence mode="wait" initial={false}>
                  <m.p key={current} className="truncate text-soft" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <span className="text-amber">❯</span> {chain[current].code}
                  </m.p>
                </AnimatePresence>
              </div>
            </div>
            <Magnetic
              onClick={() => scrollToId('short-version')}
              className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-amber/60 bg-amber/5 px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-fg transition-colors hover:bg-amber hover:text-bg md:self-auto"
            >
              Open the rabbit hole
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
            </Magnetic>
          </div>
        </m.div>
      </div>
    </section>
  )
}
