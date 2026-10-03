import { m, useMotionValue, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

/** A button that leans a few pixels toward the cursor. Mouse only; does nothing on touch or with reduced motion. */
export function Magnetic({ children, onClick, className, ariaLabel }: { children: ReactNode; onClick?: () => void; className?: string; ariaLabel?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })
  return (
    <m.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onPointerMove={e => {
        if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
      className={className}
    >
      {children}
    </m.button>
  )
}
