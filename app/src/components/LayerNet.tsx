import { m } from 'framer-motion'
import { evolution } from '../data/content'
import { cn } from '../lib/utils'

/** Nodes per layer: the network gains a layer for every year. The last one is still a question. */
const SIZES = [2, 3, 4, 4, 5, 3]
const W = 360
const H = 230
const xs = SIZES.map((_, i) => 26 + (i * (W - 52)) / (SIZES.length - 1))
const ys = (n: number) => Array.from({ length: n }, (_, j) => 100 + (j - (n - 1) / 2) * 34)

export function LayerNet({ active, className, labels = true }: { active: number; className?: string; labels?: boolean }) {
  const last = SIZES.length - 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('overflow-visible', className)} role="img" aria-label={`A small neural network with ${active + 1} of ${SIZES.length} layers drawn, one per stage up to ${evolution[active].year}.`}>
      {SIZES.slice(0, -1).map((n, i) =>
        ys(n).flatMap((y1, a) =>
          ys(SIZES[i + 1]).map((y2, b) => {
            const on = i + 1 <= active
            return (
              <m.line
                key={`${i}-${a}-${b}`}
                x1={xs[i]} y1={y1} x2={xs[i + 1]} y2={y2}
                stroke={i + 1 === active ? 'var(--color-amber)' : 'var(--color-soft)'}
                strokeWidth={1}
                initial={false}
                animate={{ pathLength: on ? 1 : 0, opacity: on ? (i + 1 === active ? 0.55 : 0.18) : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: on ? (a + b) * 0.02 : 0 }}
                strokeDasharray={i + 1 === last ? '3 4' : undefined}
              />
            )
          }),
        ),
      )}
      {SIZES.map((n, i) =>
        ys(n).map((y, j) => {
          const on = i <= active
          return (
            <m.circle
              key={`${i}-${j}`}
              cx={xs[i]} cy={y} r={6}
              initial={false}
              animate={{ scale: on ? 1 : 0.6, opacity: on ? 1 : 0.45 }}
              transition={{ duration: 0.35, delay: on ? j * 0.04 : 0 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              fill={i === active ? 'var(--color-amber)' : on ? 'var(--color-fg)' : 'transparent'}
              stroke={i === active ? 'var(--color-amber)' : on ? 'var(--color-fg)' : 'var(--color-mute)'}
              strokeWidth={on ? 1 : 1.5}
              strokeDasharray={i === last ? '2 2' : undefined}
            />
          )
        }),
      )}
      {labels && SIZES.map((_, i) => (
        <text key={i} x={xs[i]} y={H - 8} textAnchor="middle" className="font-mono" fontSize={10} letterSpacing="0.08em" fill={i === active ? 'var(--color-amber)' : i < active ? 'var(--color-soft)' : 'var(--color-dim)'}>
          {evolution[i].layer.toUpperCase()}
        </text>
      ))}
    </svg>
  )
}
