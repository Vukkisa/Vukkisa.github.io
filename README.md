# vukkisa.github.io

Jayanth Vukkisa's portfolio: AI & Data Science, with RAG, computer-vision and speech-recognition projects.

**Live:** https://vukkisa.github.io/

Built with React, TypeScript and Tailwind CSS v4, bundled by Vite. One narrow column, light and dark themes.

## How this repo is laid out

GitHub Pages serves this repository's root, so the **built site lives at the root** and the
**source lives in `app/`**:

```
app/                     source (Vite root)
  index.html             HTML shell: SEO, Open Graph, Twitter, JSON-LD, no-JS fallback
  public/                copied as-is to the root on build (favicons, og.png, robots, sitemap, images)
  src/
    data/content.ts      ← every word on the site; edit this to change the story
    sections/            Hero, Work, Journey, Lab, About, Contact
    components/          TopBar + CommandPalette (⌘K), ProjectCard, Landscape (journey illustration),
                         RagFlow, ZoneTest, TokenPlayground (the three Lab experiments), layout/
    lib/prefs.ts         theme, text size and the live design tokens (mirrored by the script in index.html)
    hooks/               scroll reveal, active section
index.html, static/      ← build output. Don't edit by hand; run `npm run build`.
assests/                 résumé PDF and photo (folder name kept so old links work)
```

## Working on it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, then write index.html + static/ to the repo root
```

Commit the build output along with the source; that's what GitHub Pages serves.

## Tests

```bash
npm run test:unit  # Vitest: zone geometry, preference parsing, pre-paint drift guard, content guards
npm run build      # the browser tests run against the built site
npm run test:e2e   # Playwright + axe: smoke, accessibility, keyboard, preferences, Lab, regressions
npm test           # all of the above, in order
```

- **Browser:** `@playwright/test` is pinned (1.56.1, Chromium r1194). Install the browser once with
  `npx playwright install chromium` (add `--with-deps` on a fresh Linux machine). If a matching
  Chromium is already installed elsewhere, point `PLAYWRIGHT_BROWSERS_PATH` at it instead.
- **Server:** the browser tests start `vite preview` on port 4173 and serve the built files from
  the repo root, so run `npm run build` first.
- **Pre-paint guard:** `app/index.html` has an inline script that repeats the preference logic
  from `app/src/lib/prefs.ts`, so the saved theme applies before the app loads.
  `tests/unit/prepaint.test.ts` runs that script against many stored values and fails if it ever
  disagrees with `parsePrefs()`. If you change `OPTIONS` or `DEFAULTS`, update the script too.
- **CI:** `.github/workflows/ci.yml` runs unit tests, a fresh build (which must match the
  committed `index.html` and `static/`), then the browser tests, on every pull request.

**Deploying:** GitHub Pages publishes the root of `main` (Settings → Pages → Deploy from a branch,
`main` / root). Merging to `main` deploys; there's no separate CI step.

## Editing the content

Everything visible comes from `app/src/data/content.ts`. Each project is a short card, roughly
50–90 words across these fields:

```
title / subtitle   what it is, specifically
context            internship / coursework / team project, and when
problem            one sentence
built              your part only, plus the approach (models, architecture)
evidence           a measured result with how it was measured, a verified capability,
                   or "evaluation pending" / "results not yet shareable". Never a goal.
tools              only what's in the code or requirements file
links              repo / demo only if public and working; otherwise privateNote
```

Internship work stays described without code, data or numbers until it's approved for sharing.

## Accessibility

Semantic landmarks, a skip link, reduced-motion support, and colour contrast that passes axe-core
in both themes.
