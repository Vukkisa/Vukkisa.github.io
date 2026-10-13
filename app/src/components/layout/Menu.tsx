import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { sections, site } from '../../data/content'
import { cn, scrollToId } from '../../lib/utils'

/** Mobile navigation. Traps focus, closes on Escape, returns focus to the trigger. */
export function Menu({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a,button')?.focus()
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
          aria-label="Site navigation"
          className="fixed inset-0 z-[60] overflow-y-auto bg-paper px-5 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex items-center justify-between">
            <p className="display text-xl">{site.name}</p>
            <button type="button" onClick={onClose} className="rounded-full border border-rule px-3.5 py-1.5 text-sm text-ink hover:border-accent hover:text-accent">
              Close
            </button>
          </div>
          <nav aria-label="Sections" className="mt-10">
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={e => { e.preventDefault(); go(s.id) }}
                    aria-current={active === s.id ? 'location' : undefined}
                    className={cn('flex items-baseline gap-5 border-b border-rule py-4 transition-colors hover:text-accent', active === s.id ? 'text-accent' : 'text-ink')}
                  >
                    <span className="label w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display text-4xl">{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <p className="mt-10 text-sm text-ink-2">
            <a href={`mailto:${site.email}`} className="prose-link">{site.email}</a>
          </p>
        </m.div>
      )}
    </AnimatePresence>
  )
}
