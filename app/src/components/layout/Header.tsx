import { AnimatePresence, m, useScroll } from 'framer-motion'
import { useRef, useState } from 'react'
import { sections } from '../../data/content'
import { useActiveSection } from '../../hooks/useActiveSection'
import { Menu } from './Menu'

const IDS = sections.map(s => s.id)

/** The top bar reads like a shell prompt: it tells you where in the story you are. */
export function Header() {
  const active = useActiveSection(IDS)
  const path = sections.find(s => s.id === active)?.path ?? '~'
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { scrollYProgress } = useScroll()

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-rule/70 bg-bg/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:pl-32 lg:pr-12">
          <a href="#top" className="min-w-0 truncate font-mono text-xs text-mute" aria-label={`Jayanth Vukkisa. Back to the top. You are in ${path}`}>
            <span className="text-fg">jayanth</span>@laptop:
            <AnimatePresence mode="wait" initial={false}>
              <m.span key={path} className="inline-block text-amber" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18 }}>
                {path}
              </m.span>
            </AnimatePresence>
            <span aria-hidden="true" className="caret ml-0.5 text-fg">▍</span>
          </a>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-menu"
            className="label rounded-full border border-rule px-3.5 py-2 text-fg transition-colors hover:border-amber hover:text-amber"
          >
            index <span aria-hidden="true">≡</span>
          </button>
        </div>
        <m.div aria-hidden="true" style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-amber" />
      </header>
      <Menu open={open} onClose={() => { setOpen(false); buttonRef.current?.focus() }} active={active} />
    </>
  )
}
