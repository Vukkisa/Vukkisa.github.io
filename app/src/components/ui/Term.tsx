import { useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** A technical term with an annotation that appears on hover, focus or tap. */
export function Term({ children, note }: { children: ReactNode; note: string }) {
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setAlignRight(r.left > window.innerWidth / 2)
    setOpen(true)
  }
  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}
        className="cursor-help underline decoration-amber/60 decoration-dotted decoration-[0.06em] underline-offset-[0.18em] transition-colors hover:text-amber"
      >
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute top-full z-40 mt-3 block w-[min(18rem,80vw)] rounded-md border border-rule bg-raised px-3.5 py-3 text-left font-mono text-xs leading-relaxed tracking-normal text-soft shadow-2xl shadow-black/50 transition-all duration-200',
          alignRight ? 'right-0' : 'left-0',
          open ? 'translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-amber">annotation</span>
        {note}
      </span>
    </span>
  )
}
