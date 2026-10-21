import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/content'
import { SCROLL_KEYS, useActiveSection } from '../hooks/useActiveSection'
import { toggleText, toggleTheme, usePrefs } from '../lib/prefs'
import { cn } from '../lib/utils'
import { LAB } from '../sections/Lab'
import { CommandPalette } from './CommandPalette'

/** In-page sections. A count is shown as a superscript and read out in words (e.g. "work (4 projects)"). */
const NAV = [
  { id: 'work', label: 'work', count: { n: projects.length, noun: 'projects' } },
  { id: 'journey', label: 'journey' },
  { id: 'lab', label: 'lab', count: { n: LAB.length, noun: 'experiments' } },
  { id: 'about', label: 'about' },
  { id: 'contact', label: 'contact' },
]
const IDS = NAV.map(n => n.id)
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const btn = 'grid size-9 place-items-center rounded-(--r-sm) text-mute transition-colors hover:bg-chip hover:text-fg'

export function TopBar() {
  const { active, pin, unpin, scrolled } = useActiveSection(IDS)
  const prefs = usePrefs()
  const [palette, setPalette] = useState(false)
  const header = useRef<HTMLElement>(null)

  // Publish the bar's real height (one row or two, normal or large text) as --header-h, for the
  // sticky journey illustration and for scroll offsets when jumping to a section.
  useEffect(() => {
    const el = header.current
    if (!el || !('ResizeObserver' in window)) return
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The page's one keydown listener: the command-menu shortcuts, and releasing a nav pin when the
  // visitor scrolls with the keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); return }
      const t = e.target as HTMLElement
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !t.closest('input, textarea, select, [contenteditable="true"]')) { e.preventDefault(); setPalette(true); return }
      if (SCROLL_KEYS.includes(e.key)) unpin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unpin])

  const next = prefs.theme === 'dark' ? 'light' : 'dark'
  return (
    <>
      <header ref={header} className={cn('sticky top-0 z-40 border-b transition-colors duration-300', scrolled ? 'border-line bg-bg/80 backdrop-blur-md' : 'border-transparent')}>
        {/* One row from md up. On phones the section links wrap onto a second row, so they stay visible. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-5 sm:px-6 lg:px-10">
          <a href="#top" className="group flex h-14 items-center gap-2.5 font-display text-[0.9375rem] font-semibold tracking-tight">
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-(--r-sm) bg-fg text-[0.6875rem] text-bg transition-colors group-hover:bg-accent group-hover:text-accent-ink">JV</span>
            <span className="max-sm:sr-only">Jayanth Vukkisa</span>
            <span className="sr-only">, back to top</span>
          </a>

          <nav aria-label="Sections" className="order-last -mx-2.5 w-[calc(100%+1.25rem)] overflow-x-auto pb-2 md:order-none md:mx-0 md:w-auto md:overflow-visible md:pb-0">
            <ul className="flex items-center gap-1 font-mono text-[0.8125rem]">
              {NAV.map(n => (
                <li key={n.id} className="shrink-0">
                  <a
                    href={`#${n.id}`}
                    onClick={() => pin(n.id)}
                    aria-current={active === n.id ? 'location' : undefined}
                    className={cn('block rounded-(--r-sm) px-2.5 py-1.5 transition-colors', active === n.id ? 'bg-chip text-fg' : 'text-mute hover:text-fg')}
                  >
                    {n.label}
                    {n.count && (
                      <>
                        <sup aria-hidden="true" className={cn('ml-0.5', active === n.id ? 'text-accent' : '')}>{n.count.n}</sup>
                        <span className="sr-only">({n.count.n} {n.count.noun})</span>
                      </>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex h-14 items-center gap-1">
            <button type="button" onClick={toggleText} aria-pressed={prefs.text === 'lg'} aria-label="Larger text" title="Larger text" className={cn(btn, 'font-display text-[0.9375rem] font-semibold', prefs.text === 'lg' && 'bg-chip text-fg')}>
              <span aria-hidden="true">A<span className="text-[0.6875rem]">a</span></span>
            </button>
            <button type="button" onClick={toggleTheme} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`} className={btn}>
              {prefs.theme === 'dark' ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
                  <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
                </svg>
              )}
            </button>
            {/* The accessible name contains the visible text ("Menu" on phones, the shortcut from md up). */}
            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-haspopup="dialog"
              title="Command menu"
              className="ml-1 inline-flex h-9 items-center gap-2 rounded-(--r-sm) border border-line px-2.5 text-xs text-soft transition-colors hover:border-line-strong hover:text-fg"
            >
              <span className="md:sr-only">Menu</span>
              <kbd className="kbd hidden border-0 p-0 text-[0.75rem] md:inline">{isMac ? '⌘' : 'Ctrl'} K</kbd>
            </button>
          </div>
        </div>
      </header>
      <CommandPalette isOpen={palette} onClose={() => setPalette(false)} />
    </>
  )
}
