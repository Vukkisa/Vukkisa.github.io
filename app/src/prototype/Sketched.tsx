import { createElement, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react'
import { sketchRect } from './sketch'

/** The hand-drawn outline itself: an SVG just outside its box, drawn with the shared pen (see proto.css). */
export function SketchFrame({ seed, w, h, pad = 7, rad = 16 }: { seed: number; w: number; h: number; pad?: number; rad?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" className="sketch" style={{ inset: -pad, width: w + pad * 2, height: h + pad * 2 }} viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}>
      <path d={sketchRect(w + pad * 2, h + pad * 2, seed, pad - 0.5, 1.5, rad)} pathLength={1} />
    </svg>
  )
}

/**
 * Wraps anything in the sketch outline. It draws on hover or keyboard focus (`when="hover"`), once
 * when it scrolls into view (`when="view"`), or only while `on` is true (`when="manual"`).
 * Touch screens and reduced motion show the finished outline (proto.css).
 */
export function Sketched({
  seed = 1, pad = 7, rad = 16, when = 'hover', on = false, as = 'div', className = '', children, ...rest
}: { seed?: number; pad?: number; rad?: number; when?: 'hover' | 'view' | 'manual'; on?: boolean; as?: 'div' | 'span' } & HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [seen, setSeen] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const el = ref.current
    if (when !== 'view' || !el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setSeen(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [when])
  return createElement(
    as,
    { ref, className: `sk-host relative ${className}`, 'data-hover': when === 'hover' ? '' : undefined, 'data-on': on || seen ? '' : undefined, ...rest },
    size && <SketchFrame seed={seed} w={size.w} h={size.h} pad={pad} rad={rad} />,
    children,
  )
}
