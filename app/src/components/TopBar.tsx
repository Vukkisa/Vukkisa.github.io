import { useEffect, useState } from 'react'
import { projects } from '../data/content'
import { useActiveSection } from '../hooks/useActiveSection'
import { toggleText, toggleTheme, usePrefs } from '../lib/prefs'
import { cn } from '../lib/utils'
import { LAB } from '../sections/Lab'
import { CommandPalette } from './CommandPalette'

const NAV = [
  { id: 'work', label: 'work', count: projects.length },
  { id: 'journey', label: 'journey' },
  { id: 'lab', label: 'lab', count: LAB.length },
  { id: 'about', label: 'about' },
  { id: 'contact', label: 'contact' },
]
const IDS = NAV.map(n => n.id)
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const btn = 'grid size-9 place-items-center rounded-(--r-sm) text-mute transition-colors hover:bg-chip hover:text-fg'

export function TopBar() {
  const { active, pin } = useActiveSection(IDS)
  const prefs = usePrefs()
  const [palette, setPalette] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); return }
      const t = e.target as HTMLElement
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !t.closest('input, textarea, select, [contenteditable="true"]')) { e.preventDefault(); setPalette(true) }
    }
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll) }
  }, [])

  const next = prefs.theme === 'dark' ? 'light' : 'dark'
  return (
    <>
      <header className={cn('sticky top-0 z-40 border-b transition-colors duration-300', scrolled ? 'border-line bg-bg/80 backdrop-blur-md' : 'border-transparent')}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-10">
          <a href="#top" className="group flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight" aria-label="Jayanth Vukkisa, back to top">
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-(--r-sm) bg-fg text-[11px] text-bg transition-colors group-hover:bg-accent group-hover:text-accent-ink">JV</span>
            <span aria-hidden="true" className="hidden sm:inline">Jayanth Vukkisa</span>
          </a>

          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-1 font-mono text-[13px]">
              {NAV.map(n => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => pin(n.id)}
                    aria-current={active === n.id ? 'location' : undefined}
                    className={cn('rounded-(--r-sm) px-2.5 py-1.5 transition-colors', active === n.id ? 'bg-chip text-fg' : 'text-mute hover:text-fg')}
                  >
                    {n.label}
                    {n.count !== undefined && <sup className={cn('ml-0.5', active === n.id ? 'text-accent' : '')}>{n.count}</sup>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={toggleText} aria-pressed={prefs.text === 'lg'} aria-label="Larger text" title="Larger text" className={cn(btn, 'font-display text-[15px] font-semibold', prefs.text === 'lg' && 'bg-chip text-fg')}>
              <span aria-hidden="true">A<span className="text-[11px]">a</span></span>
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
            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-haspopup="dialog"
              aria-label={`Open command menu (${isMac ? '⌘' : 'Ctrl+'}K)`}
              className="ml-1 inline-flex h-9 items-center gap-2 rounded-(--r-sm) border border-line px-2.5 text-xs text-soft transition-colors hover:border-line-strong hover:text-fg"
            >
              <span aria-hidden="true" className="md:hidden">Menu</span>
              <kbd aria-hidden="true" className="kbd hidden border-0 p-0 text-[12px] md:inline">{isMac ? '⌘' : 'Ctrl'} K</kbd>
            </button>
          </div>
        </div>
      </header>
      <CommandPalette isOpen={palette} onClose={() => setPalette(false)} />
    </>
  )
}
