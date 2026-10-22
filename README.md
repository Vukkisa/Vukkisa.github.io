# vukkisa.github.io

Jayanth Vukkisa's portfolio: AI engineering and applied ML, with retrieval (RAG), computer-vision
and speech-recognition projects.

**Live:** https://vukkisa.github.io/ (GitHub Pages, served from the root of `main`)

## What's on the site

One page, dark by default with a light theme, in these sections:

- **Hero:** who I am, what I'm working on now, and an illustration of the speech-recognition pipeline.
- **Selected work:** four projects (KnowYourRules, AI Surveillance, railway speech recognition,
  Ez-Learn). Each has a card and an expandable case study: problem, architecture, my part,
  evaluation, limitations and links. A case study opens from a link: `/#<project-id>-case`.
- **Journey:** the career year by year, beside an illustration that follows along. On wide screens
  the illustration stays pinned; on phones it scrolls past and only a slim row of stations stays pinned.
- **Lab:** three small experiments that run in the browser (see below).
- **About** and **Contact:** education, stack, email (with a copy button), GitHub, LinkedIn, résumé.
- **Footer:** the design tokens (accent colour, spacing, corner radius) as live controls.
- **Command menu** (`Ctrl K` / `⌘K`, `/`, or the Menu button): jump to any section, project or
  experiment, switch theme or text size, change the tokens, copy the email address.

Visitor preferences (theme, larger text, tokens) are saved in `localStorage` and applied before
first paint. Headings always use Bricolage Grotesque; there is deliberately no font choice.

## The Lab: what's real and what isn't

| Experiment | Real, computed in your browser | Simulated or illustrative | What the full version needs |
|---|---|---|---|
| **RAG, step by step** | A small retrieval pipeline over this site's own text: sentence-aware chunking, a TF-IDF index, cosine-similarity retrieval, the grounded prompt and the scores. | The "answer" is the best-matching retrieved sentence, labelled as extractive. No language model runs and nothing is sent anywhere. TF-IDF matches shared words, not meaning. | KnowYourRules itself uses dense embeddings (Ollama, nomic-embed-text), a Chroma vector store and an LLM (Groq), all outside this site. |
| **Zone check** | The point-in-polygon test (ray casting), the crossings drawn on the scene, dragging the zone and the person, playback and frame stepping. | The scene, the person's box and the movement are synthetic; the event log shows what the real tool would save. No camera, no detector. | AI Surveillance runs YOLOv8 on a camera feed or video file, outside this site. |
| **Token playground** | Real tokenization with two published OpenAI vocabularies (`o200k_base`, `cl100k_base`) through the MIT-licensed [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer) library: counts, pieces and token IDs. | Nothing simulated. Character and word counts are shown as such, never as tokens. Other model families (Llama, Gemma, Indic models) tokenize differently. | Nothing external. The vocabularies (about 1.45 MB gzipped) download from this site only when the visitor presses "Load tokenizers". |

No API keys, secrets or third-party API calls are in the client code.

## Technology

- React 19, TypeScript, Vite 8, Tailwind CSS v4
- Fonts from Fontsource, self-hosted: Bricolage Grotesque (headings), Geist (text), Geist Mono (labels)
- `gpt-tokenizer` (lazy-loaded, Token playground only)
- Tests: Vitest, Playwright (Chromium) with axe-core

## How this repo is laid out

GitHub Pages serves this repository's root, so the **built site lives at the root** and the
**source lives in `app/`**:

```
app/                     source (Vite root)
  index.html             HTML shell: SEO, Open Graph, Twitter/X, JSON-LD, no-JS fallback, pre-paint script
  public/                copied as-is to the root on build (favicons, og.png, robots, sitemap, images)
  src/
    data/content.ts      ← every word on the site; edit this to change the story
    data/corpus.ts       the RAG experiment's documents, built from content.ts
    sections/            Hero, Work, Journey, Lab, About, Contact
    components/          TopBar, CommandPalette, ProjectCard, CaseStudy, ProjectVisual, Landscape,
                         RagFlow, ZoneTest, Tokenizer (the Lab), DesignTokens, layout/
    lib/                 prefs (preferences), rag, tokenize, geometry, utils
    hooks/               active section, deep links, scroll reveal, pausing off-screen animation
tests/unit, tests/e2e    Vitest and Playwright tests
scripts/                 size budget, social preview image, project illustrations
index.html, static/      ← build output, committed. Don't edit by hand; run `npm run build`.
og.png, favicons, …      ← copied from app/public by the build
assests/                 résumé PDF and photo (folder name kept so old links work)
```

## Working on it

Needs Node 22 (what CI uses).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, then write index.html + static/ (and app/public's files) to the root
npm run preview    # serve the built root locally
```

### Tests and checks

```bash
npm run test:unit  # Vitest: geometry, RAG engine, tokenizers, preferences, pre-paint guard, content, metadata
npm run build      # the browser tests and the size check run against the built site
npm run size       # JavaScript/CSS size budget (see below)
npm run test:e2e   # Playwright + axe: smoke, accessibility in both themes, keyboard, preferences,
                   # navigation and deep links, projects, the Lab, phone layouts, regressions
npm test           # all of the above, in order
```

- **Browser:** `@playwright/test` is pinned (1.56.1, Chromium r1194). Install the browser once with
  `npx playwright install chromium` (add `--with-deps` on a fresh Linux machine), or point
  `PLAYWRIGHT_BROWSERS_PATH` at an existing install of the same revision. Only Chromium is tested.
- **Server:** the browser tests start `vite preview` on port 4173 and serve the built root, so
  build first.
- **Pre-paint guard:** the inline script in `app/index.html` repeats the preference logic from
  `app/src/lib/prefs.ts` so the saved theme applies before the app loads.
  `tests/unit/prepaint.test.ts` fails if the two ever disagree. If you change `OPTIONS` or
  `DEFAULTS`, update the script too.

### Size budget

`npm run size` (`scripts/check-size.mjs`) gzips (level 9) the files the browser downloads on first
load, as named in the built `index.html`, and fails if they're over budget:

| What | Measured (Phase 5) | Budget |
|---|---|---|
| First-load JavaScript (one entry script) | 98.9 kB | 110 kB |
| CSS | 11.1 kB | 14 kB |
| Tokenizer chunks (`o200k_base`, `cl100k_base`, `GptEncoding`), downloaded only on request | 1,448.7 kB | not counted as first load |

It also fails if the tokenizer vocabularies stop being separate chunks reached through a dynamic
`import()`, or if `index.html` starts loading or preloading them. (kB = 1,000 bytes. Vite's own
build log uses a different gzip level, so its numbers differ slightly.)

### Social preview image

`app/public/og.png` (1200×630) is rendered from the site's own colours and fonts by
`npm run og` (`scripts/og-image.mjs`, uses Playwright's Chromium). Run `npm run build` afterwards
so the root copy updates. The Open Graph and Twitter/X tags in `app/index.html` point at
`https://vukkisa.github.io/og.png`; `tests/unit/metadata.test.ts` checks the tags and the image size.
Social networks cache previews, so a changed image can take a while to appear when shared.

## Deploying, and contributing without deploying by accident

GitHub Pages publishes the root of `main` (Settings → Pages → Deploy from a branch, `main` / root).
There's no deploy workflow: **whatever is committed to `main` is the live site**, including the
committed build in `index.html` and `static/`.

So:

1. Work on a branch, never directly on `main`. Pushing a branch doesn't deploy anything.
2. Commit the source and the fresh build together (`npm run build`), so the branch is exactly
   what would go live.
3. Open a pull request. `.github/workflows/ci.yml` runs on pull requests: unit tests, a fresh
   build that must match the committed one, the size budget, then the browser and accessibility
   tests. Check its result on the pull request; don't assume it passed.
4. Merge only after review. Merging to `main` is the deploy.

Protecting `main` in the repository settings (require a pull request and the CI check) makes
step 1 enforceable; that's a repository setting, not something this repo's files can do.

## Editing the content

Everything visible comes from `app/src/data/content.ts`. Each project is a short card, roughly
50–90 words across these fields, plus an optional `caseStudy`:

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
Project illustrations are labelled as illustrations and show no real results.

## Known content gap

- **Résumé:** `assests/Jayanth_Vukkisa_Resume.pdf` is out of date. It needs a new source file
  from Jayanth; replace the PDF at the same path so every existing link keeps working.

## Accessibility

Semantic landmarks, a skip link, visible focus everywhere, keyboard control of every experiment,
reduced-motion support (looping animations also pause off screen), a larger-text option, and
colour contrast that passes axe-core in both themes (checked in the browser tests).
