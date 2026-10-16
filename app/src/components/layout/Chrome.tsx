import { site } from '../../data/content'

export function SkipLink() {
  return (
    <a href="#main" className="sr-only z-50 rounded-md bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      Skip to content
    </a>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-10 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 border-t border-line pt-6 font-mono text-[11px] text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location} · built with React & Tailwind ·{' '}
          <a href={site.source} target="_blank" rel="noopener noreferrer" className="link text-mute">
            source<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="flex items-center gap-4">
          <span>press <kbd className="kbd">/</kbd> for the command menu</span>
          <a href="#top" className="link text-mute">back to top ↑</a>
        </p>
      </div>
    </footer>
  )
}
