import { useRef, useState } from 'react'
import { sections, site } from '../../data/content'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/utils'
import { Menu } from './Menu'

// 'top' is observed too, so nothing is highlighted while the hero is on screen.
const IDS = ['top', ...sections.map(s => s.id)]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="grid size-9 place-items-center rounded-full border border-rule text-ink-2 transition-colors hover:border-accent hover:text-accent"
    >
      {theme === 'dark' ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  )
}

export function Header() {
  const active = useActiveSection(IDS)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-paper/85 px-5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-3">
          <a href="#top" className="display text-xl text-ink transition-colors hover:text-accent">
            {site.name}
          </a>
          <div className="flex items-center gap-2 sm:gap-6">
            <nav aria-label="Sections" className="hidden md:block">
              <ul className="flex items-center gap-6">
                {sections.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={active === s.id ? 'location' : undefined}
                      className={cn('text-sm transition-colors hover:text-accent', active === s.id ? 'text-accent' : 'text-ink-2')}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeToggle />
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="site-menu"
              className="rounded-full border border-rule px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => { setOpen(false); buttonRef.current?.focus() }} active={active} />
    </>
  )
}
