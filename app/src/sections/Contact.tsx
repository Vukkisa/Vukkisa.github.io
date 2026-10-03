import { useState } from 'react'
import { Section } from '../components/ui/Section'
import { site } from '../data/content'

const LINKS = [
  { label: 'GitHub', value: 'github.com/Vukkisa', href: site.github },
  { label: 'LinkedIn', value: 'in/jayanthvukkisa', href: site.linkedin },
  { label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { label: 'Résumé', value: 'Download the PDF', href: site.resume },
]

export function Contact() {
  const [copied, setCopied] = useState('')
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied('Email copied. I read everything.') }
    catch { setCopied('Copy didn\'t work here. Select the address instead.') }
    window.setTimeout(() => setCopied(''), 3500)
  }
  return (
    <Section id="contact" path="~/contact" title={<>Got an interesting problem?<br /><em className="italic text-amber">Let's build something.</em></>}>
      <ul className="border-t border-rule">
        {LINKS.map(l => {
          const external = l.href.startsWith('http')
          return (
            <li key={l.label} className="group relative flex flex-wrap items-baseline gap-x-8 gap-y-1 border-b border-rule py-6">
              <span className="label w-24 shrink-0">{l.label}</span>
              <a
                href={l.href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="display min-w-0 break-all text-[clamp(1.8rem,4.6vw,3.6rem)] leading-tight transition-colors hover:text-amber"
              >
                {l.value}
                <span aria-hidden="true" className="ml-3 inline-block text-amber transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                {external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
              {l.label === 'Email' && (
                <button type="button" onClick={copy} className="ml-auto rounded-full border border-rule px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-mute transition-colors hover:border-amber hover:text-amber">
                  copy
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p aria-live="polite" className="mt-4 min-h-5 font-mono text-xs text-amber">{copied}</p>
    </Section>
  )
}
