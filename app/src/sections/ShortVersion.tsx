import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'
import { Term } from '../components/ui/Term'
import { facts, shortVersion, type Segment } from '../data/content'

const render = (segments: Segment[]) =>
  segments.map((s, i) => (typeof s === 'string' ? <span key={i}>{s}</span> : <Term key={i} note={s.note}>{s.term}</Term>))

/** Each sentence comes into focus as you read down to it. */
function Sentence({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: ReactNode }) {
  const reduce = useReducedMotion()
  const opacity = useTransform(progress, range, [0.4, 1])  // large text: stays above 3:1 even unfocused
  return (
    <m.p style={{ opacity: reduce ? 1 : opacity }} className="font-serif text-[clamp(1.75rem,3.7vw,3.1rem)] leading-[1.14] tracking-[-0.01em]">
      {children}
    </m.p>
  )
}

export function ShortVersion() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })
  const n = shortVersion.length

  return (
    <Section id="short-version" path="~/short-version" title="The short version.">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
        <div ref={ref} className="space-y-9">
          {shortVersion.map((para, i) => (
            <Sentence key={i} progress={scrollYProgress} range={[i / n, (i + 0.9) / n]}>{render(para)}</Sentence>
          ))}
        </div>

        <Reveal className="self-start lg:sticky lg:top-28">
          <figure>
            <picture>
              <source type="image/webp" srcSet="/images/jayanth-320.webp 320w, /images/jayanth-640.webp 640w" sizes="(min-width: 1024px) 256px, 60vw" />
              <img
                src="/assests/jayanth.jpg"
                width={640}
                height={800}
                loading="lazy"
                decoding="async"
                alt="Jayanth, smiling, on a forest road in the hills, with a red STOP sign behind him"
                className="aspect-[4/5] w-full max-w-64 rounded-lg object-cover grayscale transition duration-500 hover:grayscale-0"
              />
            </picture>
            <figcaption className="mt-4 max-w-64 font-mono text-[11px] leading-relaxed text-mute">
              Me, somewhere in the hills, in front of a STOP sign. Fitting, for someone who builds traffic-law tools.
            </figcaption>
          </figure>
          <ul className="mt-8 space-y-2 border-t border-rule pt-5 font-mono text-[11px] text-soft">
            {facts.map(f => <li key={f}>{f}</li>)}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
