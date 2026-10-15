import { useEffect, useRef, useState } from 'react'
import { Section } from '../components/ui/Section'
import { site } from '../data/content'

export function Contact() {
  const [copied, setCopied] = useState('')
  const address = useRef<HTMLAnchorElement>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied('Copied.')
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
    <Section id="contact" title="Contact">
      <p className="text-[15px] leading-relaxed text-soft">
        Questions about any of this work, or a role you think fits? Email is the quickest way to reach me.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a ref={address} href={`mailto:${site.email}`} className="link text-[15px] font-medium">{site.email}</a>
        <button type="button" onClick={copy} className="rounded-md border border-line px-2.5 py-1 text-xs text-soft transition-colors hover:bg-chip hover:text-fg">
          Copy<span className="sr-only"> email address</span>
        </button>
        <span aria-live="polite" className="text-xs text-mute">{copied}</span>
      </div>
    </Section>
  )
}
