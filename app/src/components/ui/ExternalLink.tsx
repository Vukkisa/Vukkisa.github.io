import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const external = /^https?:/.test(href)
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn('group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-fg transition-colors hover:text-amber', className)}
    >
      <span className="border-b border-amber/50 pb-0.5 group-hover:border-amber">{children}</span>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">{external ? '↗' : '→'}</span>
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  )
}
