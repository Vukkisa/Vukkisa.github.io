import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** A text link with an arrow. External links open in a new tab and say so to screen readers. */
export function ExternalLink({ href, children, note, className }: { href: string; children: ReactNode; note?: string; className?: string }) {
  const external = /^https?:/.test(href)
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn('group inline-flex items-baseline gap-1.5 text-sm font-medium text-ink transition-colors hover:text-accent', className)}
    >
      <span className="underline decoration-rule-strong underline-offset-4 group-hover:decoration-accent">{children}</span>
      <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">{external ? '↗' : '→'}</span>
      {note && <span className="text-xs font-normal text-mute">({note})</span>}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  )
}
