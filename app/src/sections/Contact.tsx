import { useState } from 'react'
import { Section } from '../components/ui/Section'
import { site } from '../data/content'

const LINKS = [
  { label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { label: 'LinkedIn', value: 'in/jayanthvukkisa', href: site.linkedin },
  { label: 'GitHub', value: 'github.com/Vukkisa', href: site.github },
  { label: 'Résumé', value: 'Download the PDF', href: site.resume },
]

export function Contact() {
  const [copied, setCopied] = useState('')
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied('Email address copied.') }
    catch { setCopied('Copying didn’t work here. Select the address instead.') }
    window.setTimeout(() => setCopied(''), 3500)
  }
  return (
    <Section
      id="contact"
      index="04"
      kicker="Contact"
      title={<>Let’s <em className="text-accent">talk.</em></>}
      intro="Questions about any of this work, or a role you think fits? Email is the quickest way to reach me."
    >
      <ul className="border-t border-rule-strong">
        {LINKS.map(l => {
          const external = l.href.startsWith('http')
          return (
            <li key={l.label} className="group flex flex-wrap items-baseline gap-x-8 gap-y-1 border-b border-rule py-5">
              <span className="label w-24 shrink-0">{l.label}</span>
              <a
                href={l.href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="display min-w-0 break-all text-[clamp(1.7rem,4vw,3rem)] leading-tight transition-colors hover:text-accent"
              >
                {l.value}
                <span aria-hidden="true" className="ml-3 inline-block text-[0.6em] text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                {external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
              {l.label === 'Email' && (
                <button type="button" onClick={copy} className="ml-auto rounded-full border border-rule-strong px-3.5 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:text-accent">
                  Copy<span className="sr-only"> email address</span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-accent">{copied}</p>
    </Section>
  )
}
