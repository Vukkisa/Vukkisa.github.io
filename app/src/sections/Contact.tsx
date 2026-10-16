import { useEffect, useRef, useState } from 'react'
import { site } from '../data/content'

export function Contact() {
  const [copied, setCopied] = useState('')
  const address = useRef<HTMLSpanElement>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied('Copied ☺︎')
    } catch {
      // No Clipboard API, or permission denied: select the address so it can be copied by hand.
      const range = document.createRange()
      if (address.current) range.selectNodeContents(address.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      setCopied('Couldn’t copy automatically. The address is selected: press Ctrl+C (⌘C on a Mac).')
    }
    timer.current = window.setTimeout(() => setCopied(''), 4000)
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="sec">
      <div data-reveal className="border-t border-line pt-5">
        <p className="eyebrow"><span aria-hidden="true">05 ✉ </span>Contact</p>
        <h2 id="contact-title" className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[.95] tracking-[-.035em]">
          Got a role, a question or a messy dataset<span className="text-accent">?</span>
        </h2>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-soft sm:text-base">Email is the quickest way to reach me.</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`mailto:${site.email}`} className="group inline-flex items-center gap-3 font-display text-[clamp(1.25rem,4vw,2.25rem)] font-medium tracking-tight transition-colors hover:text-accent">
            <span ref={address} className="underline decoration-line-strong decoration-2 underline-offset-[6px] group-hover:decoration-accent">{site.email}</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <button type="button" onClick={copy} className="chip border border-line-strong px-3 py-1.5 text-xs text-soft transition-colors hover:border-accent hover:text-accent">
            Copy<span className="sr-only"> email address</span>
          </button>
          <span aria-live="polite" className="text-xs text-mute">{copied}</span>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[['GitHub', site.github], ['LinkedIn', site.linkedin]].map(([label, href]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="link">{label}<span aria-hidden="true" className="nudge text-mute"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>
            </li>
          ))}
          <li><a href={site.resume} className="link">Résumé (PDF)</a></li>
        </ul>
      </div>
    </section>
  )
}
