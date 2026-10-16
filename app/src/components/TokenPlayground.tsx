import { DEFAULTS, OPTIONS, resetTokens, setPref, usePrefs, type Prefs, type TokenKey } from '../lib/prefs'
import { cn } from '../lib/utils'

/**
 * The site's own design tokens as live controls. Each choice sets a data-* attribute on <html>,
 * the CSS variables in index.css follow, and the whole page restyles. Choices are remembered.
 */
const GROUPS: { key: TokenKey; label: string; names: Record<string, string> }[] = [
  { key: 'accent', label: 'Colour', names: { cobalt: 'Cobalt', ember: 'Ember', moss: 'Moss', rose: 'Rose', mono: 'Mono' } },
  { key: 'type', label: 'Type', names: { grotesk: 'Grotesk', sans: 'Sans', mono: 'Mono' } },
  { key: 'density', label: 'Spacing', names: { compact: 'Compact', cozy: 'Cozy', airy: 'Airy' } },
  { key: 'radius', label: 'Radius', names: { none: 'Square', soft: 'Soft', round: 'Round' } },
]

const SWATCH: Record<string, string> = { cobalt: 'bg-[#4d63ff]', ember: 'bg-[#f0763a]', moss: 'bg-[#3fb873]', rose: 'bg-[#e8559a]', mono: 'bg-fg' }

export function TokenPlayground() {
  const prefs = usePrefs()
  const changed = GROUPS.some(g => prefs[g.key] !== DEFAULTS[g.key])
  return (
    <div>
      <p className="text-sm leading-relaxed text-soft">These are the tokens this site is built from. Change one and the whole page follows: headings, cards, the journey illustration, everything.</p>

      <div className="mt-5 space-y-4">
        {GROUPS.map(g => (
          <fieldset key={g.key} className="grid items-center gap-2 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
            <legend className="sr-only">{g.label}</legend>
            <span aria-hidden="true" className="font-mono text-[11px] uppercase tracking-wider text-mute">{g.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {(OPTIONS[g.key] as readonly string[]).map(v => {
                const on = prefs[g.key] === v
                return (
                  <label key={v} className={cn('chip inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent', on ? 'border-fg bg-fg text-bg' : 'border-line text-soft hover:border-line-strong hover:text-fg')}>
                    <input type="radio" name={`token-${g.key}`} value={v} checked={on} onChange={() => setPref(g.key, v as Prefs[typeof g.key])} className="sr-only" />
                    {g.key === 'accent' && <span aria-hidden="true" className={cn('size-2.5 rounded-full', SWATCH[v])} />}
                    {g.key === 'type' && <span aria-hidden="true" className={cn('text-[13px] leading-none', v === 'grotesk' && 'font-[Bricolage_Grotesque_Variable] font-semibold', v === 'mono' && 'font-mono')}>Aa</span>}
                    {g.names[v]}
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* A small specimen, so the change is visible right here as well as across the page. */}
      <div aria-hidden="true" className="pad mt-6 rounded-(--r) border border-line bg-bg">
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-6xl font-semibold leading-none tracking-tight">Aa<span className="text-accent">.</span></p>
          <div className="flex gap-1.5">
            {['bg-accent', 'bg-accent/60', 'bg-accent/30', 'bg-accent-soft'].map(c => <span key={c} className={cn('size-6 rounded-(--r-sm) border border-line', c)} />)}
          </div>
        </div>
        <p className="mt-4 font-display text-lg font-medium leading-snug">I build AI that reads the rules.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink">Primary</span>
          <span className="chip border border-line-strong px-3 py-1.5 text-xs">Secondary</span>
          <span className="chip border border-line px-2 py-1 font-mono text-[11px] text-soft">tag</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex flex-wrap gap-x-3 font-mono text-[11px] text-mute">
          {GROUPS.map(g => <span key={g.key} className="whitespace-nowrap">--{g.key}: {prefs[g.key]}</span>)}
        </p>
        <button type="button" onClick={resetTokens} disabled={!changed} className="chip shrink-0 border border-line px-3 py-1 text-xs text-soft transition-colors hover:text-fg disabled:opacity-40">Reset</button>
      </div>
    </div>
  )
}
