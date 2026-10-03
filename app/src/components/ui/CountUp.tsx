import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

/** Counts a metric up from zero the first time it scrolls into view. Screen readers get the final value. */
export function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const final = `${prefix}${value}${suffix}`

  useEffect(() => {
    const el = ref.current
    if (!inView || !el) return
    if (reduce) { el.textContent = final; return }
    const c = animate(0, value, { duration: 1.1, ease: [0.25, 1, 0.5, 1], onUpdate: v => { el.textContent = `${prefix}${Math.round(v)}${suffix}` } })
    return () => c.stop()
  }, [inView, reduce, value, prefix, suffix, final])

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">{prefix}0{suffix}</span>
    </>
  )
}
