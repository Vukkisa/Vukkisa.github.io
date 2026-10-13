import { ThemeToggle } from '../components/ThemeToggle'
import { intro, site } from '../data/content'

const LINKS = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Email', href: `mailto:${site.email}` },
  { label: 'Résumé', href: site.resume },
]

export function Intro() {
  return (
    <header id="top" className="rise">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="/images/jayanth-avatar.webp"
            width={64}
            height={64}
            decoding="async"
            fetchPriority="high"
            alt="Jayanth Vukkisa"
            className="size-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
            <p className="mt-0.5 text-sm text-mute">{intro.role}</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-soft">
        <p className="text-fg">{intro.lines[0]}</p>
        <p>{intro.lines[1]}</p>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {LINKS.map(l => {
          const external = l.href.startsWith('http')
          return (
            <li key={l.label}>
              <a href={l.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="link">
                {l.label}
                {external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          )
        })}
      </ul>
    </header>
  )
}
