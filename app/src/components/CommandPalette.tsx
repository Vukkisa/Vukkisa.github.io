import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { projects, site } from '../data/content'
import { resetTokens, toggleText, toggleTheme, usePrefs } from '../lib/prefs'
import { cn } from '../lib/utils'

type Cmd = { id: string; group: string; label: string; hint?: string; keywords?: string; run: () => void }

/** Scroll to a section or project and move keyboard focus there, so the next Tab continues from it. */
export function goTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`)
  el.scrollIntoView({ block: 'start' })
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer')

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [note, setNote] = useState('')
  const prefs = usePrefs()
  const id = useId()

  const commands = useMemo<Cmd[]>(() => [
    ...([['top', 'Home'], ['work', 'Selected work'], ['journey', 'Journey'], ['lab', 'Lab'], ['about', 'About'], ['contact', 'Contact']] as const)
      .map(([to, label]) => ({ id: `go-${to}`, group: 'Go to', label, keywords: to, run: () => goTo(to) })),
    ...projects.map(p => ({ id: `p-${p.id}`, group: 'Projects', label: p.title, hint: p.subtitle, keywords: p.tools.join(' '), run: () => goTo(p.id) })),
    { id: 'exp-zone', group: 'Lab', label: 'Try the zone check', keywords: 'yolo polygon surveillance', run: () => goTo('lab-zone') },
    { id: 'exp-rag', group: 'Lab', label: 'Step through the RAG pipeline', keywords: 'retrieval knowyourrules', run: () => goTo('lab-rag') },
    { id: 'exp-tokens', group: 'Lab', label: 'Play with design tokens', keywords: 'colour color accent radius spacing type', run: () => goTo('lab-tokens') },
    { id: 'theme', group: 'Preferences', label: `Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} theme`, keywords: 'dark light mode', run: toggleTheme },
    { id: 'text', group: 'Preferences', label: prefs.text === 'lg' ? 'Use normal text size' : 'Use larger text', keywords: 'font size zoom accessibility', run: toggleText },
    { id: 'reset', group: 'Preferences', label: 'Reset design tokens', keywords: 'default', run: resetTokens },
    {
      id: 'copy', group: 'Contact', label: 'Copy email address', hint: site.email, keywords: 'mail',
      run: () => { navigator.clipboard?.writeText(site.email).then(() => setNote('Email address copied.'), () => setNote(`Couldn’t copy. The address is ${site.email}`)) },
    },
    { id: 'mail', group: 'Contact', label: 'Write an email', hint: site.email, run: () => { location.href = `mailto:${site.email}` } },
    { id: 'gh', group: 'Links', label: 'GitHub', hint: 'opens in a new tab', run: () => open(site.github) },
    { id: 'li', group: 'Links', label: 'LinkedIn', hint: 'opens in a new tab', run: () => open(site.linkedin) },
    { id: 'cv', group: 'Links', label: 'Résumé (PDF)', run: () => { location.href = site.resume } },
    { id: 'ez', group: 'Links', label: 'Ez-Learn live demo', hint: 'opens in a new tab', run: () => open('https://ez-learn.onrender.com/') },
  ], [prefs.theme, prefs.text])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c => `${c.label} ${c.group} ${c.hint ?? ''} ${c.keywords ?? ''}`.toLowerCase().includes(q))
  }, [commands, query])
  const groups = [...new Set(results.map(r => r.group))]

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (isOpen && !d.open) { setQuery(''); setActive(0); setNote(''); d.showModal(); input.current?.focus() }
    if (!isOpen && d.open) d.close()
  }, [isOpen])

  useEffect(() => {
    document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, id])

  const run = (c: Cmd) => {
    // Preferences and copy keep the palette open so the result is visible; everything else closes it first.
    if (c.group === 'Preferences' || c.id === 'copy') { c.run(); if (c.group === 'Preferences') setNote('Done.'); return }
    onClose()
    window.setTimeout(c.run, 0)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!results.length) return
      setActive(a => (a + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length)
    } else if (e.key === 'Home' && e.ctrlKey) { setActive(0) }
    else if (e.key === 'End' && e.ctrlKey) { setActive(results.length - 1) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const c = results[active]
      if (c) run(c)
    }
  }

  let index = -1
  return (
    <dialog
      ref={dialog}
      aria-label="Command menu"
      onClose={onClose}
      onClick={e => { if (e.target === dialog.current) onClose() }}
      className="palette m-0 mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-(--r) border border-line-strong bg-card p-0 text-fg shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <span aria-hidden="true" className="font-mono text-sm text-mute">⌘</span>
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? `${id}-opt-${active}` : undefined}
          aria-label="Type a command or search"
          placeholder="Type a command or search…"
          value={query}
          onChange={e => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={onKey}
          className="h-13 w-full bg-transparent text-[15px] outline-none placeholder:text-mute"
        />
        <kbd className="kbd">esc</kbd>
      </div>

      <div id={`${id}-list`} role="listbox" aria-label="Commands" className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
        {groups.map(g => (
          <div key={g}>
            <div aria-hidden="true" className="px-2 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-mute first:pt-1">{g}</div>
            <div role="group" aria-label={g}>
              {results.filter(r => r.group === g).map(c => {
                const i = ++index
                return (
                  <div
                    key={c.id}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => run(c)}
                    className={cn('flex cursor-pointer items-baseline justify-between gap-4 rounded-(--r-sm) px-3 py-2 text-sm', i === active ? 'bg-accent text-accent-ink' : 'text-soft')}
                  >
                    <span>{c.label}</span>
                    {c.hint && <span className={cn('truncate text-xs', i === active ? 'text-accent-ink/80' : 'text-mute')}>{c.hint}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-mute">Nothing matches “{query}”.</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2 font-mono text-[11px] text-mute">
        <span aria-live="polite">{note}</span>
        <span className="hidden gap-3 sm:flex"><span><kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> move</span><span><kbd className="kbd">↵</kbd> select</span></span>
      </div>
    </dialog>
  )
}
