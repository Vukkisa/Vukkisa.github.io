import { AnimatePresence, m } from 'framer-motion'
import { useRef, useState } from 'react'
import { Section } from '../components/ui/Section'
import { toolbox } from '../data/content'
import { cn, rovingIndex } from '../lib/utils'

/** Tools sorted by the verb they serve, not by logo. */
export function Toolbox() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const g = toolbox[active]
  const select = (i: number, focus = false) => { setActive(i); if (focus) tabs.current[i]?.focus() }

  return (
    <Section id="toolbox" path="~/toolbox" title={<>Sorted by <em className="italic text-amber">what they're for.</em></>} intro="Not a wall of logos. Pick a verb.">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
        <div role="tablist" aria-orientation="vertical" aria-label="What I use tools for" className="flex flex-col border-t border-rule">
          {toolbox.map((t, i) => (
            <button
              key={t.verb}
              ref={el => { tabs.current[i] = el }}
              role="tab"
              type="button"
              id={`verb-${t.verb}`}
              aria-selected={i === active}
              aria-controls="verb-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              onMouseEnter={() => select(i)}
              onKeyDown={e => { const k = rovingIndex(e.key, i, toolbox.length, true); if (k !== null) { e.preventDefault(); select(k, true) } }}
              className={cn('group flex items-baseline gap-5 border-b border-rule py-3 text-left transition-colors', i === active ? 'text-fg' : 'text-dim hover:text-soft')}
            >
              <span className="w-6 font-mono text-[11px] text-mute">{String(i + 1).padStart(2, '0')}</span>
              <span className="display text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.95]">{t.verb}</span>
              <span aria-hidden="true" className={cn('ml-auto font-mono text-sm transition-all', i === active ? 'translate-x-0 text-amber opacity-100' : '-translate-x-2 opacity-0')}>→</span>
            </button>
          ))}
        </div>

        <div id="verb-panel" role="tabpanel" aria-labelledby={`verb-${g.verb}`} tabIndex={0} className="self-start lg:sticky lg:top-28">
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={g.verb} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <p className="label text-amber">{g.verb.toLowerCase()}</p>
              <p className="display mt-3 text-4xl leading-tight">{g.blurb}</p>
              <ul className="mt-8 border-t border-rule">
                {g.tools.map((t, j) => (
                  <m.li
                    key={t.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.04, duration: 0.25 }}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-3.5"
                  >
                    <span className="text-lg">{t.name}</span>
                    {t.usedIn && <span className="font-mono text-[11px] text-mute">used in · <span className="text-soft">{t.usedIn.join(' · ')}</span></span>}
                  </m.li>
                ))}
              </ul>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  )
}
