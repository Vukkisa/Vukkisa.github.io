# vukkisa.github.io

Jayanth Vukkisa's portfolio: *I started with SQL. Then I wanted to know what the data could do.*

Built with React, TypeScript, Tailwind CSS v4 and Framer Motion, bundled by Vite.

## How this repo is laid out

GitHub Pages serves this repository's root, so the **built site lives at the root** and the
**source lives in `app/`**:

```
app/                     source (Vite root)
  index.html             HTML shell: SEO, Open Graph, Twitter, JSON-LD, no-JS fallback
  public/                copied as-is to the root on build (favicons, og.png, robots, sitemap, images)
  src/
    data/content.ts      ← every word on the site; edit this to change the story
    sections/            one component per chapter (Hero, ShortVersion, Evolution, Builds, …)
    components/          reusable pieces (Pipeline, LayerNet, ZoneDemo, ProjectStory, ui/, layout/)
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

Everything visible comes from `app/src/data/content.ts`. Lines marked `// DRAFT` were written
from the brief and are worth a read: the "what changed" lines in the timeline, the engineering
decisions in each pipeline, the statuses in the tabs and the lab, and the lessons.
Lab statuses support `ABANDONED` too; use it where it's true.

## Accessibility

Semantic landmarks, a skip link, keyboard-operable tabs (arrow keys, Home, End), a focus-trapped
menu, reduced-motion support throughout, and colour contrast that passes axe-core.
