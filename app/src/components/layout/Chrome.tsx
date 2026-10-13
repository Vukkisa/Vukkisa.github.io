import { site } from '../../data/content'

export function SkipLink() {
  return (
    <a href="#main" className="sr-only z-[70] rounded-md bg-accent px-4 py-2 text-sm text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      Skip to content
    </a>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-rule px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name} · {site.location}</p>
        <p>
          Built with React, TypeScript and Tailwind ·{' '}
          <a href={site.source} target="_blank" rel="noopener noreferrer" className="prose-link">
            site source<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </footer>
  )
}
