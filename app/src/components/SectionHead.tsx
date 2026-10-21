/**
 * Section heading: a mono kicker (index and glyph), a display title, an optional count and a short
 * note. The count shows as "(4)" but is read out in words ("Selected work (4 projects)").
 */
export function SectionHead({ id, n, glyph, title, count, note }: { id: string; n: string; glyph: string; title: string; count?: { n: number; noun: string }; note?: string }) {
  return (
    <header data-reveal className="grid gap-4 border-t border-line pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-8">
      <div>
        <p aria-hidden="true" className="t-kicker">{n} <span className="text-accent">{glyph}</span></p>
        <h2 id={id} className="t-section mt-3">
          {title}
          {count && (
            <>
              <sup aria-hidden="true" className="ml-1.5 align-super font-mono text-sm font-normal tracking-normal text-accent">({count.n})</sup>
              <span className="sr-only">({count.n} {count.noun})</span>
            </>
          )}
        </h2>
      </div>
      {note && <p className="max-w-xs text-sm leading-relaxed text-mute sm:text-right">{note}</p>}
    </header>
  )
}
