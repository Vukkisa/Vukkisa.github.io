import type { Status } from '../../data/content'
import { cn } from '../../lib/utils'

const tone: Record<Status, string> = {
  SHIPPED: 'text-mint border-mint/40',
  BUILDING: 'text-amber border-amber/40',
  EXPERIMENT: 'text-sky border-sky/40',
  EXPERIMENTING: 'text-sky border-sky/40',
  LEARNING: 'text-lilac border-lilac/40',
  ABANDONED: 'text-coral border-coral/40',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] leading-none tracking-[0.1em]', tone[status], className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

export const statusDot: Record<Status, string> = {
  SHIPPED: 'bg-mint', BUILDING: 'bg-amber', EXPERIMENT: 'bg-sky', EXPERIMENTING: 'bg-sky', LEARNING: 'bg-lilac', ABANDONED: 'bg-coral',
}
