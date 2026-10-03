import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Section } from '../components/ui/Section'
import { lessons } from '../data/content'

function Lesson({ lesson, index }: { lesson: (typeof lessons)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0.05, 0.35, 0.7, 0.98], [0.45, 1, 1, 0.45])
  return (
    <li ref={ref} className="grid gap-4 border-t border-rule py-12 md:grid-cols-[4rem_minmax(0,1fr)_13rem] md:gap-8">
      <span className="font-mono text-xs text-amber">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <m.p style={{ opacity: reduce ? 1 : opacity }} className="display text-[clamp(2rem,4.8vw,4rem)] leading-[1.02]">{lesson.text}</m.p>
        <p className="mt-5 max-w-2xl leading-relaxed text-soft">{lesson.detail}</p>
      </div>
      <p className="label md:pt-3 md:text-right">learned on <span className="block text-fg md:mt-1">{lesson.from}</span></p>
    </li>
  )
}

export function Lessons() {
  return (
    <Section id="lessons" path="~/lessons" title={<>Things I've learned <em className="italic text-amber">while building.</em></>} intro="Not quotes. Notes I'd leave for my past self.">
      <ol>{lessons.map((l, i) => <Lesson key={l.text} lesson={l} index={i} />)}</ol>
    </Section>
  )
}
