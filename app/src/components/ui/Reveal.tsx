import { m } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.25, 1, 0.5, 1] as const

/** Fades content up once as it enters the viewport. Fast on purpose. */
export function Reveal({ children, delay = 0, y = 18, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </m.div>
  )
}
