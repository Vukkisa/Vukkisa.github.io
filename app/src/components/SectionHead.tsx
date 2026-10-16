/** Section heading: a mono index and glyph, a big display title, an optional count and a short note. */
export function SectionHead({ id, n, glyph, title, count, note }: { id: string; n: string; glyph: string; title: string; count?: number; note?: string }) {
  return (
    <header data-reveal className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
      <h2 id={id} className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        <span aria-hidden="true" className="mr-3 align-top font-mono text-xs font-normal tracking-normal text-mute">{n} {glyph}</span>
        {title}
        {count !== undefined && <sup className="ml-1.5 font-mono text-sm font-normal tracking-normal text-accent">({count})</sup>}
      </h2>
      {note && <p className="max-w-xs text-sm text-mute sm:text-right">{note}</p>}
    </header>
  )
}
