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
    <footer className="mt-20 border-t border-line pt-6 text-xs text-mute">
      <p>
        © {new Date().getFullYear()} {site.name} · {site.location} ·{' '}
        <a href={site.source} target="_blank" rel="noopener noreferrer" className="link text-mute">
          source<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </footer>
  )
}
