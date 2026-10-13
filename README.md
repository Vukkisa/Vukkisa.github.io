# vukkisa.github.io

Jayanth Vukkisa's portfolio: *I started with SQL. Then I wanted to know what the data could do.*

Built with React, TypeScript, Tailwind CSS v4 and Framer Motion, bundled by Vite. Light and dark themes.

## How this repo is laid out

GitHub Pages serves this repository's root, so the **built site lives at the root** and the
**source lives in `app/`**:

```
app/                     source (Vite root)
  index.html             HTML shell: SEO, Open Graph, Twitter, JSON-LD, no-JS fallback
  public/                copied as-is to the root on build (favicons, og.png, robots, sitemap, images)
  src/
    data/content.ts      ← every word on the site; edit this to change the story
    sections/            one component per chapter (Hero, Work, Journey, Experience, Contact)
    components/          reusable pieces (CaseFile, Flow, ui/, layout/)
    hooks/, lib/         small helpers
index.html, static/      ← build output. Don't edit by hand; run `npm run build`.
assests/                 résumé PDF and the original photo (folder name kept so old links work)
```

## Working on it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, then write index.html + static/ to the repo root
```

Commit the build output along with the source; that's what GitHub Pages serves.

## Editing the content

Everything visible comes from `app/src/data/content.ts`. Each project is a "case file": problem,
what I did, key decisions, limits and status, plus its real pipeline (`flow`). On a team project,
mark the steps you built with `mine: true`.

One rule: only write what can be backed up. Link the evidence (a repo or a demo), label where the
work came from (internship, coursework, team project), and add results only once they're measured
and shareable. Internship work stays described without code, data or numbers until approved.

## Accessibility

Semantic landmarks, a skip link, a focus-trapped mobile menu, reduced-motion support, and colour
contrast that passes axe-core in both themes.
