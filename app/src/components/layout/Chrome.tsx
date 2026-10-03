import { site } from '../../data/content'

export function SkipLink() {
  return (
    <a href="#main" className="sr-only z-[70] rounded-md bg-amber px-4 py-2 font-mono text-xs text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      Skip to content
    </a>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-rule px-5 py-8 sm:px-8 lg:pl-32 lg:pr-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 font-mono text-[11px] text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name} · {site.location}</p>
        <p>
          Built from scratch with React, TypeScript, Tailwind and Framer Motion ·{' '}
          <a href={site.source} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-amber/50 underline-offset-4 hover:text-amber">
            read the source<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </footer>
  )
}
