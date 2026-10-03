import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PipelineNode } from '../data/content'
import { useSpotlight } from '../hooks/useSpotlight'
import { cn, rovingIndex } from '../lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = { id: string; title: string; nodes: PipelineNode[]; extra?: (index: number) => ReactNode }

/**
 * An architecture diagram you can walk through. It plays itself while on screen; the moment the
 * visitor hovers, clicks or uses the arrow keys, it hands control over and stops autoplaying.
 */
export function Pipeline({ id, title, nodes, extra }: Props) {
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const inView = useInView(wrap, { margin: '-20% 0px -20% 0px' })
  const reduce = useReducedMotion()
  const spot = useSpotlight<HTMLDivElement>()

  useEffect(() => {
    if (!inView || touched || reduce) return
    const t = window.setInterval(() => setActive(a => (a + 1) % nodes.length), 2800)
    return () => window.clearInterval(t)
  }, [inView, touched, reduce, nodes.length])

  // Keep the active stage visible inside the horizontally scrolling strip, without moving the page.
  useEffect(() => {
    const s = strip.current, b = tabs.current[active]
    if (!s || !b || s.scrollWidth <= s.clientWidth) return
    s.scrollTo({ left: b.offsetLeft - s.clientWidth / 2 + b.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [active, reduce])

  const select = (i: number, focus = false) => {
    setTouched(true)
    setActive(i)
    if (focus) tabs.current[i]?.focus()
  }
  const node = nodes[active]

  return (
    <div ref={wrap} onPointerMove={spot} className="spotlight overflow-hidden rounded-xl border border-rule bg-panel/70">
      <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3">
        <p className="label truncate">{title}</p>
        <p className="label shrink-0 tabular-nums">
          {pad(active + 1)}/{pad(nodes.length)}
          <span className="ml-2 text-dim">{touched || reduce ? 'manual' : 'autoplay'}</span>
        </p>
      </div>

      <div ref={strip} role="tablist" aria-label={`${title}: stages`} className="no-scrollbar flex overflow-x-auto px-3 pt-5">
        {nodes.map((n, i) => (
          <button
            key={n.label}
            ref={el => { tabs.current[i] = el }}
            role="tab"
            type="button"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            onMouseEnter={() => select(i)}
            onKeyDown={e => { const k = rovingIndex(e.key, i, nodes.length); if (k !== null) { e.preventDefault(); select(k, true) } }}
            className="group relative flex min-w-[7.25rem] flex-1 flex-col items-start gap-2 px-2 pb-4 text-left"
          >
            <span className="flex w-full items-center" aria-hidden="true">
              <span className={cn('size-2.5 shrink-0 rounded-full border transition-colors duration-300', i < active ? 'border-fg bg-fg' : i === active ? 'border-amber bg-amber shadow-[0_0_0_5px_rgb(255_178_36/0.15)]' : 'border-mute')} />
              {i < nodes.length - 1 && <span className={cn('h-px flex-1 transition-colors duration-500', i < active ? 'bg-fg/50' : 'bg-rule')} />}
            </span>
            <span className="font-mono text-[10px] text-dim">{pad(i + 1)}</span>
            <span className={cn('text-sm leading-tight transition-colors', i === active ? 'text-amber' : i < active ? 'text-fg' : 'text-mute group-hover:text-fg')}>{n.label}</span>
            {i === active && <m.span layoutId={`${id}-marker`} aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 bg-amber" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
          </button>
        ))}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="border-t border-rule px-5 py-7 sm:px-7">
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="label">what happens</p>
                <p className="mt-3 text-lg leading-relaxed text-fg">{node.what}</p>
              </div>
              <div>
                <p className="label text-amber">the engineering decision</p>
                <p className="mt-3 font-serif text-2xl leading-snug">{node.decision}</p>
                {node.tech && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technology">
                    {node.tech.map(t => <li key={t} className="rounded border border-rule px-2 py-0.5 font-mono text-[10px] text-mute">{t}</li>)}
                  </ul>
                )}
              </div>
            </div>
            {extra?.(active)}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
