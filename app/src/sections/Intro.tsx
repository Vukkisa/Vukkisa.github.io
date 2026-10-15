import { ThemeToggle } from '../components/ThemeToggle'
import { useActiveSection } from '../hooks/useActiveSection'
import { cn } from '../lib/utils'
import { intro, site } from '../data/content'

const LINKS = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Email', href: `mailto:${site.email}` },
  { label: 'Résumé', href: site.resume },
]

/** In-page sections, in page order. Skills is short and sits just above Contact, so it's left out. */
const SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]
const IDS = SECTIONS.map(s => s.id)

export function Intro() {
  const { active, pin } = useActiveSection(IDS)
  return (
    <header id="top" className="rise lg:sticky lg:top-0 lg:max-h-svh lg:self-start lg:overflow-y-auto lg:py-20">
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="On this page">
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] sm:gap-x-4 sm:text-sm">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => pin(s.id)}
                  aria-current={active === s.id ? 'location' : undefined}
                  className={cn(
                    'relative transition-colors hover:text-fg',
                    active === s.id ? 'text-fg after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-accent' : 'text-mute',
                  )}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
      </div>

      <div className="mt-10 flex items-start justify-between gap-6">
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
      </div>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-soft">
        {intro.lines.map(line => <p key={line}>{line}</p>)}
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
