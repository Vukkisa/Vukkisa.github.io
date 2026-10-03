import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { sections } from '../../data/content'
import { cn, scrollToId } from '../../lib/utils'

/** Full-screen index of the story. Traps focus, closes on Escape, returns focus to the trigger. */
export function Menu({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    const first = panel.current?.querySelector<HTMLElement>('a,button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>('a,button')]
      const i = items.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus() }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { root.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  const go = (id: string) => {
    onClose()
    requestAnimationFrame(() => { history.replaceState(null, '', `#${id}`); scrollToId(id) })
  }

  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Index of sections"
          className="fixed inset-0 z-[60] overflow-y-auto bg-bg/97 px-5 py-6 backdrop-blur-lg sm:px-8 lg:pl-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="label">ls ~/jayanth</p>
            <button type="button" onClick={onClose} className="label rounded-full border border-rule px-3.5 py-2 text-fg hover:border-amber hover:text-amber">
              close <span aria-hidden="true">✕</span>
            </button>
          </div>
          <nav aria-label="Sections" className="mx-auto mt-10 max-w-6xl">
            <ol>
              {sections.map((s, i) => (
                <m.li key={s.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i, duration: 0.3 }}>
                  <a
                    href={`#${s.id}`}
                    onClick={e => { e.preventDefault(); go(s.id) }}
                    aria-current={active === s.id ? 'location' : undefined}
                    className={cn('group flex items-baseline gap-5 border-b border-rule py-3.5 transition-colors hover:text-amber', active === s.id ? 'text-amber' : 'text-fg')}
                  >
                    <span className="label w-8 shrink-0">{String(i).padStart(2, '0')}</span>
                    <span className="display text-[clamp(1.8rem,5vw,3.2rem)] transition-transform group-hover:translate-x-2">{s.title}</span>
                    <span className="ml-auto hidden font-mono text-xs text-mute sm:block">{s.path}</span>
                  </a>
                </m.li>
              ))}
            </ol>
          </nav>
        </m.div>
      )}
    </AnimatePresence>
  )
}
