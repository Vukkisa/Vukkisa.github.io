import { AnimatePresence, m } from 'framer-motion'
import { useRef, useState } from 'react'
import { Section } from '../components/ui/Section'
import { StatusBadge, statusDot } from '../components/ui/StatusBadge'
import { obsessions, statusMeaning } from '../data/content'
import { cn, rovingIndex } from '../lib/utils'

const REFUSALS = [
  'Tried closing it. It reopened itself.',
  'That one\'s staying open.',
  'Closing tabs is a skill I haven\'t learned yet.',
  'Closed. Reopened. Pinned.',
]

/** My skills section, rendered as the browser window it actually is. */
export function Obsessions() {
  const [active, setActive] = useState(0)
  const [msg, setMsg] = useState('')
  const [nudge, setNudge] = useState<number | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const o = obsessions[active]

  const select = (i: number, focus = false) => { setActive(i); if (focus) tabs.current[i]?.focus() }
  const tryClose = (i: number) => {
    setNudge(i)
    setMsg(REFUSALS[Math.floor(Math.random() * REFUSALS.length)])
    window.setTimeout(() => setNudge(null), 400)
  }

  return (
    <Section
      id="tabs"
      path="~/open-tabs"
      title={<>Things currently taking up <em className="italic text-amber">too many tabs.</em></>}
      intro="Instead of a skills list: the topics I keep coming back to, and the question each one keeps asking me."
    >
      <div className="overflow-hidden rounded-xl border border-rule bg-panel shadow-2xl shadow-black/40">
        <div className="flex items-end gap-3 border-b border-rule bg-bg/70 pl-3 pt-2.5">
          <span aria-hidden="true" className="flex shrink-0 gap-1.5 pb-3 pl-1">
            <i className="size-2.5 rounded-full bg-raised" /><i className="size-2.5 rounded-full bg-raised" /><i className="size-2.5 rounded-full bg-raised" />
          </span>
          <div role="tablist" aria-label="Open tabs" className="no-scrollbar flex min-w-0 flex-1 overflow-x-auto">
            {obsessions.map((t, i) => (
              <m.div
                key={t.slug}
                role="presentation"
                animate={nudge === i ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                className={cn(
                  'group relative -mb-px flex min-w-[8.75rem] max-w-[12.5rem] flex-1 items-center rounded-t-lg border border-b-0 py-2 pl-3 pr-1.5',
                  i === active ? 'border-rule bg-panel text-fg' : 'border-transparent text-mute hover:bg-raised/50 hover:text-fg',
                )}
              >
                <button
                  ref={el => { tabs.current[i] = el }}
                  role="tab"
                  type="button"
                  id={`tab-${t.slug}`}
                  aria-selected={i === active}
                  aria-controls="tab-panel"
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => select(i)}
                  aria-keyshortcuts="Delete"
                  onKeyDown={e => {
                    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); tryClose(i); return }
                    const k = rovingIndex(e.key, i, obsessions.length); if (k !== null) { e.preventDefault(); select(k, true) }
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left text-[13px]"
                >
                  <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', statusDot[t.status])} />
                  <span className="truncate">{t.topic}</span>
                </button>
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  title={`Close the ${t.topic} tab`}
                  onClick={() => tryClose(i)}
                  className="ml-1 grid size-5 shrink-0 place-items-center rounded text-dim transition-colors hover:bg-raised hover:text-fg"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </m.div>
            ))}
          </div>
          <span className="label hidden shrink-0 pb-3 pr-4 sm:block">{obsessions.length} open</span>
        </div>

        <div className="flex items-center gap-3 border-b border-rule px-4 py-2.5">
          <span aria-hidden="true" className="font-mono text-xs text-dim">←  →  ↻</span>
          <p className="min-w-0 flex-1 truncate rounded-md bg-bg px-3 py-1.5 font-mono text-xs text-mute">
            jayanth://obsessions/<span className="text-fg">{o.slug}</span>
          </p>
          <span className="hidden shrink-0 sm:block"><StatusBadge status={o.status} /></span>
        </div>

        <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${o.slug}`} tabIndex={0} className="min-h-[19rem] px-6 py-10 sm:px-12 sm:py-14">
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={o.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="label text-fg">{o.topic}</h3>
                <span className="sm:hidden"><StatusBadge status={o.status} /></span>
              </div>
              <blockquote className="display mt-6 max-w-4xl text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05]">
                <span className="text-amber">“</span>{o.question}<span className="text-amber">”</span>
              </blockquote>
              <p className="mt-8 font-mono text-xs text-mute"><span className="text-soft">{o.status}</span> · {statusMeaning[o.status]}</p>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
      <p aria-live="polite" className="mt-4 min-h-5 font-mono text-xs text-amber">{msg}</p>
    </Section>
  )
}
