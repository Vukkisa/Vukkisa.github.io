import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ProjectVisual } from './components/ProjectVisual'
import { certifications, chapters, education, intro, moreWork, now, projects, site, skillGroups } from './data/content'
import { organicRoute, sketchRing, smoothPath, type Pt } from './lib/sketch'
import { Sketched } from './components/Sketched'
import { CaseStudy } from './components/CaseStudy'
import { CommandPalette } from './components/CommandPalette'
import { Landscape } from './components/Landscape'
import { SignalFigure } from './components/SignalFigure'
import { RagFlow } from './components/RagFlow'
import { Tokenizer } from './components/Tokenizer'
import { ZoneTest } from './components/ZoneTest'
import { useHashLinks } from './hooks/useHashLinks'
import { usePauseOffscreen } from './hooks/usePauseOffscreen'
import { SCROLL_KEYS, SCROLLED, useActiveSection } from './hooks/useActiveSection'
import { useReveal } from './hooks/useReveal'
import { Footer, SkipLink } from './components/layout/Chrome'
import { toggleText, toggleTheme, usePrefs } from './lib/prefs'

/** A short hand-drawn wave. Used as the nav indicator and under headings. */
const WAVE = 'M1 4 C 9 -1, 17 -1, 25 4 S 41 9, 50 4 S 67 -1, 75 4 S 92 9, 99 4'
function Wave() {
  return (
    <svg viewBox="0 -2 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={WAVE} pathLength={1} />
    </svg>
  )
}

/** The three Lab experiments (the command menu and the project cards link to these ids). */
const LAB = [
  { id: 'lab-rag', n: '01', title: 'RAG, step by step', tag: 'from KnowYourRules' },
  { id: 'lab-zone', n: '02', title: 'Zone check', tag: 'from AI Surveillance' },
  { id: 'lab-tokens', n: '03', title: 'Token playground', tag: 'how models read text' },
]

const NAV = ['work', 'journey', 'lab', 'about', 'contact'] as const

/**
 * The nav. One thin wavy line sits under the current section's link and glides to the next one
 * as you scroll. It also follows hover and keyboard focus, then returns to the current section.
 * The line is decoration only: the current link carries aria-current, and every link is a normal
 * focusable anchor.
 */
function Nav() {
  const { active, pin, unpin, scrolled } = useActiveSection(NAV)
  const prefs = usePrefs()
  const nextTheme = prefs.theme === 'dark' ? 'light' : 'dark'
  const list = useRef<HTMLUListElement>(null)
  const [peek, setPeek] = useState('')
  const [box, setBox] = useState<{ x: number; w: number } | null>(null)
  const [palette, setPalette] = useState(false)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  const target = peek || active

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); return }
      const t = e.target as HTMLElement
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !t.closest('input, textarea, select, [contenteditable="true"]')) { e.preventDefault(); setPalette(true); return }
      if (SCROLL_KEYS.includes(e.key)) unpin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unpin])

  useLayoutEffect(() => {
    const ul = list.current
    if (!ul) return
    const measure = () => {
      const a = ul.querySelector<HTMLElement>(`[data-id="${target}"]`)
      setBox(a ? { x: a.offsetLeft + 8, w: a.offsetWidth - 16 } : null)
    }
    measure()
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null
    ro?.observe(ul)
    document.fonts?.ready.then(measure)
    return () => ro?.disconnect()
  }, [target])

  // On phones the list can scroll sideways: keep the current link in view.
  useEffect(() => {
    const ul = list.current
    const a = ul?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (ul && a) ul.scrollTo({ left: a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])

  return (
    <>
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md" data-scrolled={scrolled || undefined}>
      <div className="mx-auto flex h-14 max-w-[40rem] items-center justify-between gap-3 px-5">
        <a href="#top" className="font-display text-[0.9375rem] font-semibold tracking-tight transition-colors hover:text-accent max-sm:sr-only">
          <span aria-hidden="true">JV</span><span className="sr-only">{site.name}, back to top</span>
        </a>
        <nav aria-label="Sections" className="min-w-0">
          <ul ref={list} onMouseLeave={() => setPeek('')} className="relative flex items-center overflow-x-auto font-mono text-[0.8125rem] [scrollbar-width:none]">
            {NAV.map(id => (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  data-id={id}
                  onClick={() => pin(id)}
                  onMouseEnter={() => setPeek(id)}
                  onFocus={() => setPeek(id)}
                  onBlur={() => setPeek('')}
                  aria-current={active === id ? 'location' : undefined}
                  className={`block px-2 py-2 transition-colors sm:px-2.5 hover:text-fg focus-visible:text-fg ${active === id ? 'text-fg' : 'text-mute'}`}
                >
                  {id}
                </a>
              </li>
            ))}
            <span
              aria-hidden="true"
              key={active}
              className={`pn-bar draw ${box ? 'on' : ''}`}
              style={{ width: box?.w ?? 0, transform: `translateX(${box?.x ?? 0}px)` }}
            >
              <Wave />
            </span>
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggleText} aria-pressed={prefs.text === 'lg'} aria-label="Larger text" title="Larger text" className={`grid size-9 place-items-center rounded-full font-display text-[0.9375rem] font-semibold transition-colors hover:text-fg ${prefs.text === 'lg' ? 'text-fg' : 'text-mute'}`}>
            <span aria-hidden="true">A<span className="text-[0.6875rem]">a</span></span>
          </button>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`} className="grid size-9 place-items-center rounded-full text-mute transition-colors hover:text-fg">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" /></svg>
          </button>
          <Sketched as="span" seed={5} pad={3} rad={8}>
            <button type="button" onClick={() => setPalette(true)} aria-haspopup="dialog" title="Command menu" className="inline-flex h-9 items-center gap-2 rounded-(--r-sm) border border-line px-2.5 text-xs text-soft transition-colors hover:text-fg">
              <span className="md:sr-only">Menu</span>
              <kbd className="kbd hidden border-0 p-0 text-[0.75rem] md:inline">{isMac ? '⌘' : 'Ctrl'} K</kbd>
            </button>
          </Sketched>
        </div>
      </div>
      <svg aria-hidden="true" focusable="false" className="hdr-rule" viewBox="0 0 100 4" preserveAspectRatio="none"><path d="M0 2.2 C 9 1.2, 17 3, 28 2.1 S 47 1.2, 58 2.2 S 80 3.1, 100 1.9" vectorEffect="non-scaling-stroke" /></svg>
    </header>
    <CommandPalette isOpen={palette} onClose={() => setPalette(false)} />
    </>
  )
}


/**
 * A single hand-drawn line that wanders down the margins and draws itself as you scroll,
 * ending in a small plug at the contact section (a nod to "get in touch"). Desktop only:
 * on narrow screens there is no margin to run it through. Decoration, hidden from assistive tech.
 */
function ScrollLine() {
  const path = useRef<SVGPathElement>(null)
  const plug = useRef<SVGGElement>(null)
  const tip = useRef<SVGCircleElement>(null)
  type Geo = { w: number; h: number; d: string; ex: number; ey: number; cum: number[]; maxY: number[]; total: number; intro: number }
  const [geo, setGeo] = useState<Geo | null>(null)

  useLayoutEffect(() => {
    const build = () => {
      const w = document.documentElement.clientWidth
      const h = document.documentElement.scrollHeight
      if (w < 1024) { setGeo(null); return }
      const sy0 = window.scrollY
      const rect = (id: string) => document.getElementById(id)?.getBoundingClientRect()
      const portrait = rect('portrait')
      // the page's content column is centred, so its right edge mirrors the portrait's left edge
      const colL = portrait ? portrait.left : (w - 600) / 2
      const colR = w - colL
      const laneL = Math.max(22, colL - 54), laneR = Math.min(w - 22, colR + 54)
      const gap = (id: string) => (rect(`${id}-title`)?.top ?? rect(id)?.top ?? 0) + sy0 - 58
      const sx = portrait ? portrait.right : w / 2
      const sy = portrait ? portrait.bottom + sy0 - portrait.height * 0.45 : 60
      // out of the portrait, a short swoop into the right-hand margin, then down the margin (never across the text)
      const way: Pt[] = [[sx, sy], [sx + (laneR - sx) * 0.45, sy - 12], [laneR - 30, sy + 4], [laneR, sy + 70]]
      let side = 1 // 1 = right lane, -1 = left lane; the line starts on the right
      let prev = sy + 70
      const lane = (sd: number) => (sd > 0 ? laneR : laneL)
      const ids = ['work', 'journey', 'lab', 'about', 'contact']
      let introY = 0
      ids.forEach((id, i) => {
        const gy = gap(id)
        const from = lane(side), to = lane(-side)
        const arrive = Math.max(prev + 40, gy - 84)
        // stay in the margin the whole way down: a point at least every ~420px
        for (let y = prev + 420; y < arrive - 120; y += 420) way.push([from, y])
        way.push([from, arrive])
        if (i === 0) introY = Math.min(arrive, prev + 420)
        // a hand-drawn divider across the gap above the section title, then on down the other side
        const n = 6
        for (let k = 1; k <= n; k++) way.push([from + ((to - from) * k) / n, gy + (k % 2 ? 6 : -6)])
        prev = gy + 6
        side = -side
      })
      const emailY = (rect('contact-email')?.top ?? 0) + sy0 + 18
      const ex = lane(side)
      way.push([ex, Math.max(prev + 60, emailY)])
      const route = organicRoute(way, 7, 18)
      const d = smoothPath(route)
      const cum = [0]
      const maxY = [route[0][1]]
      for (let i = 1; i < route.length; i++) {
        cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]))
        maxY.push(Math.max(maxY[i - 1], route[i][1]))
      }
      const total = cum[cum.length - 1]
      let ii = route.findIndex(p => p[1] >= introY)
      if (ii < 0) ii = 1
      setGeo({ w, h, d, ex, ey: emailY, cum, maxY, total, intro: cum[ii] / total })
    }
    build()
    const ro = 'ResizeObserver' in window ? new ResizeObserver(build) : null
    ro?.observe(document.body)
    window.addEventListener('load', build)
    return () => { ro?.disconnect(); window.removeEventListener('load', build) }
  }, [])

  useEffect(() => {
    if (!geo || !path.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const len = path.current.getTotalLength()
    let raf = 0
    let intro = 0
    // fraction of the route whose running-maximum height has been reached by the reading position
    const fracAt = (y: number) => {
      const { maxY, cum, total } = geo
      let lo = 0, hi = maxY.length - 1
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (maxY[m] <= y) lo = m; else hi = m - 1 }
      return cum[lo] / total
    }
    const draw = () => {
      raf = 0
      const head = window.scrollY + window.innerHeight * 0.62
      const atEnd = window.scrollY + window.innerHeight >= geo.h - 4
      const p = reduce ? 1 : atEnd ? 1 : Math.max(intro, fracAt(head))
      path.current!.style.strokeDashoffset = String(1 - p)
      if (plug.current) plug.current.style.opacity = p > 0.985 ? '1' : '0'
      if (tip.current) {
        if (reduce || p <= 0.002 || p > 0.985) tip.current.style.opacity = '0'
        else {
          const pt = path.current!.getPointAtLength(p * len)
          tip.current.setAttribute('cx', pt.x.toFixed(1)); tip.current.setAttribute('cy', pt.y.toFixed(1))
          tip.current.style.opacity = '1'
        }
      }
    }
    // on load the line draws its first stretch by itself (portrait, then down to the first divider)
    let t0 = 0, introRaf = 0
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const step = (now: number) => {
      t0 ||= now
      const t = Math.min(1, (now - t0) / 2600)
      intro = geo.intro * ease(t)
      draw()
      if (t < 1) introRaf = requestAnimationFrame(step)
    }
    const startIntro = window.setTimeout(() => { if (!reduce) introRaf = requestAnimationFrame(step) }, 1100)
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw()
    window.addEventListener(SCROLLED, onScroll)
    return () => { window.removeEventListener(SCROLLED, onScroll); if (raf) cancelAnimationFrame(raf); window.clearTimeout(startIntro); cancelAnimationFrame(introRaf) }
  }, [geo])

  if (!geo) return null
  return (
    <svg aria-hidden="true" focusable="false" className="scroll-line" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
      <path ref={path} d={geo.d} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
      <circle ref={tip} className="pen-tip" r="3.4" style={{ opacity: 0 }} />
      <g ref={plug} className="plug" transform={`translate(${geo.ex} ${geo.ey})`}>
        <rect x="-11" y="2" width="22" height="16" rx="4" />
        <path d="M-5 2 V-6 M5 2 V-6" />
      </g>
    </svg>
  )
}

/**
 * The profile photograph, framed by a hand-drawn purple outline that draws itself once, then the
 * photo fades in. The only motion is that single reveal.
 */
function Portrait() {
  return (
    <span id="portrait" className="portrait relative block aspect-[4/5] w-44 text-accent sm:w-52" tabIndex={0}>
      <span className="portrait-photo absolute inset-[3.5%] overflow-hidden rounded-[10px]">
        <img
          src="/images/jayanth-640.webp"
          width={640}
          height={800}
          alt="Jayanth Vukkisa"
          fetchPriority="high"
          className="h-full w-full origin-[42%_30%] scale-[1.3] object-cover"
        />
      </span>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 200 250" preserveAspectRatio="none" className="portrait-line absolute inset-0 size-full overflow-visible" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        <path d="M16 4 C62 1 140 3 184 4 C196 5 197 12 196 26 C198 92 197 170 196 224 C196 243 190 246 180 246 C130 249 70 247 22 246 C7 246 4 240 4 228 C2 160 3 92 4 26 C4 11 8 5 16 4Z" />
      </svg>
    </span>
  )
}

function Contact() {
  const [copied, setCopied] = useState('')
  const address = useRef<HTMLAnchorElement>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async () => {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied('Copied ☺︎')
    } catch {
      // No Clipboard API, or permission denied: select the address so it can be copied by hand.
      const range = document.createRange()
      if (address.current) range.selectNodeContents(address.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      setCopied('Couldn’t copy automatically. The address is selected: press Ctrl+C (⌘C on a Mac).')
    }
    timer.current = window.setTimeout(() => setCopied(''), 4000)
  }
  return (
    <>
      <p data-reveal className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <a ref={address} id="contact-email" href={`mailto:${site.email}`} className="p-link font-display text-[clamp(1.25rem,5vw,1.75rem)] font-medium tracking-tight">{site.email}</a>
        <button type="button" onClick={copy} className="btn btn-secondary btn-sm">Copy<span className="sr-only"> email address</span></button>
      </p>
      <p aria-live="polite" className="mt-2 min-h-4 text-xs text-mute">{copied}</p>
    </>
  )
}

function Heading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-reveal>
      <h2 id={id} className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        <span className="wave-u">{children}<Wave /></span>
      </h2>
    </div>
  )
}

const TONE = { done: 'text-live', progress: 'text-progress', live: 'text-live' } as const

function Entry({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const [open, setOpen] = useState(false)
  // A case study opened from outside (command menu, #hash link) lives inside this card's hidden
  // panel: open the card, bring it into view and put focus on the case study's summary.
  useEffect(() => {
    const onToggle = (e: Event) => {
      const d = e.target
      if (!(d instanceof HTMLDetailsElement) || d.id !== `${p.id}-case` || !d.open) return
      setOpen(true)
      requestAnimationFrame(() => {
        // scrolls the card's panel and the page together, leaving the case study just under the top bar
        d.style.scrollMarginTop = '4.5rem'
        d.scrollIntoView({ block: 'start' })
        d.querySelector('summary')?.focus({ preventScroll: true })
      })
    }
    document.addEventListener('toggle', onToggle, true)
    return () => document.removeEventListener('toggle', onToggle, true)
  }, [p.id])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open])
  return (
    <li data-reveal className="h-full list-none">
      <Sketched seed={11 + i * 7} on={open} className="pcard-wrap h-full" data-open={open || undefined}>
        <article id={p.id} aria-labelledby={`${p.id}-t`} onClick={e => { if (!open && !(e.target as HTMLElement).closest('button')) setOpen(true) }} className="pcard group relative h-full scroll-mt-24 overflow-hidden rounded-(--r) border border-line bg-card">
          <div className="flex h-full flex-col">
            <figure className="pcard-img cover relative aspect-[16/10] shrink-0 overflow-hidden border-b border-line" data-loop={p.visual ? '' : undefined}>
              <div className="pcard-img-in h-full w-full">
                {p.visual ? (
                  <ProjectVisual kind={p.visual} />
                ) : (
                  <>
                    <img src={`/images/projects/${p.cover}-dark.svg`} alt="" width={1200} height={900} loading="lazy" className="hidden h-full w-full object-cover dark:block" />
                    <img src={`/images/projects/${p.cover}.svg`} alt="" width={1200} height={900} loading="lazy" className="h-full w-full object-cover dark:hidden" />
                  </>
                )}
              </div>
              <span className="absolute left-2 top-2 z-[1] rounded-full bg-bg/85 px-2 py-0.5 font-mono text-[0.625rem] text-soft backdrop-blur-sm">Illustration</span>
            </figure>
            <div className="flex flex-1 flex-col p-4">
              <p className="font-mono text-[0.6875rem] text-mute">
                {String(i + 1).padStart(2, '0')} <span className={TONE[p.status.tone]}>· {p.status.label}</span>
              </p>
              <h3 id={`${p.id}-t`} className="mt-1.5 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-soft">{p.subtitle}</p>
              <ul aria-label="Tools" className="mt-3 flex flex-wrap gap-1.5">
                {p.tools.slice(0, 4).map(t => <li key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.6875rem] text-mute">{t}</li>)}
              </ul>
              <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className="p-link mt-auto flex items-center gap-1.5 self-start pt-4 font-mono text-xs text-mute">
                Open details <span aria-hidden="true" className="pcard-arrow inline-block">→</span>
              </button>
            </div>
          </div>

          <div className="pcard-panel absolute inset-0 overflow-y-auto overscroll-contain bg-bg/95 p-5 backdrop-blur-sm" tabIndex={0} role="region" aria-label={`${p.title} details`}>
            <p className="font-mono text-[0.6875rem] text-mute">{p.context}</p>
            <h4 className="mt-1.5 font-display text-xl font-semibold tracking-tight">{p.title}</h4>
            <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-soft">
              <p>{p.problem}</p>
              <p><span className="text-fg">What I built.</span> {p.built}</p>
              <p><span className="text-fg">Evidence.</span> {p.evidence}</p>
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-mute">{p.tools.join(' · ')}</p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
              {p.links.map(l => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="p-link">{l.label} ↗<span className="sr-only"> (opens in a new tab)</span></a>)}
              {p.lab && <a href={p.lab.href} className="p-link">{p.lab.label} →</a>}
              {p.privateNote && <span className="text-mute">{p.privateNote}</span>}
            </p>
            <div className="mt-5"><CaseStudy p={p} /></div>
            <button type="button" onClick={() => setOpen(false)} className="p-link mt-4 font-mono text-xs text-mute">Close ×</button>
          </div>
        </article>
      </Sketched>
    </li>
  )
}

const STATIONS = ['Data', 'Processing', 'Learning', 'Retrieval', 'Applications']

/** Where the thread is: one chip per station. The current one is circled by hand and named (on phones only that one is named). */
function Stations({ stage }: { stage: number }) {
  return (
    <ol aria-label="Stations" className="flex flex-wrap gap-1.5 font-mono text-[0.6875rem]">
      {STATIONS.map((st, i) => {
        const cur = stage === i + 1
        return (
          <li key={st} aria-current={cur ? 'step' : undefined}>
            <Sketched as="span" when="manual" on={cur} seed={31 + i} pad={3} rad={8} className="block">
              <span className={`block px-2 py-1 transition-colors duration-500 ${cur ? 'text-accent' : stage > i + 1 ? 'text-fg' : 'text-mute'}`}>
                {String(i + 1).padStart(2, '0')}<span className={cur ? '' : 'max-sm:sr-only'}> {st}</span>
              </span>
            </Sketched>
          </li>
        )
      })}
    </ol>
  )
}

/** A chapter's dot: a small hand-drawn ring that closes, and a dot that fills, once the chapter is reached. */
function Dot({ on, seed }: { on: boolean; seed: number }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 17 17" className={`jdot absolute -left-[9px] top-1 size-[17px] ${on ? 'on' : ''}`}>
      <circle className="base" cx="8.5" cy="8.5" r="6.5" />
      <path d={sketchRing(17, seed)} pathLength={1} />
      <circle className="core" cx="8.5" cy="8.5" r="3" />
    </svg>
  )
}

/**
 * The career year by year, with the isometric landscape from the original: as each chapter reaches
 * the middle of the screen the thread runs on to that chapter's station. Phone-style layout at every
 * width (the page column is narrow): the picture scrolls past once, the station row stays pinned.
 */
/** The Lab, in place: each experiment opens inline, and #lab-… links (the palette, the old links) open the right one. */
function LabList() {
  const [openId, setOpenId] = useState<string | null>(null)
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1)
      if (!LAB.some(l => l.id === h)) return
      setOpenId(h)
      window.setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  const body: Record<string, ReactNode> = { 'lab-rag': <RagFlow />, 'lab-zone': <ZoneTest />, 'lab-tokens': <Tokenizer /> }
  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {LAB.map(l => {
        const open = openId === l.id
        return (
          <li key={l.id} id={l.id} data-reveal className="scroll-mt-20 outline-none">
            <button type="button" aria-expanded={open} aria-controls={`${l.id}-panel`} onClick={() => setOpenId(open ? null : l.id)} className="group flex w-full items-baseline justify-between gap-4 py-4 text-left">
              <span><span className="font-mono text-xs text-mute">{l.n}</span> <span className="ml-2 font-display text-xl font-semibold tracking-tight group-hover:text-accent">{l.title}</span></span>
              <span className="font-mono text-xs text-mute">{l.tag} <span aria-hidden="true">{open ? '↑' : '↓'}</span></span>
            </button>
            {open && <div id={`${l.id}-panel`} className="mb-6 rounded-(--r) border border-line bg-card p-4">{body[l.id]}</div>}
          </li>
        )
      })}
    </ul>
  )
}

function Journey() {
  const [current, setCurrent] = useState(0)
  const items = useRef<(HTMLLIElement | null)[]>([])
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setCurrent(chapters.length - 1); return }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i)) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    items.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])
  const stage = chapters[current].station
  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-16 pb-20">
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
        <filter id="sk-wobble" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" /></filter>
      </svg>
      <Heading id="journey-title">Journey</Heading>
      <p data-reveal className="mt-4 text-mute">From SQL tables to systems that answer back.</p>
      {/* From 640px up the picture and the stations stay pinned under the header, so the thread is visible as it runs. */}
      <div className="sm:sticky sm:top-14 sm:z-10 sm:-mx-5 sm:mt-6 sm:border-b sm:border-line sm:bg-bg/95 sm:px-5 sm:pb-3 sm:pt-2 sm:backdrop-blur-sm">
        <figure data-loop className="jfig mt-8 sm:mt-0">
          <div className="dot-grid mx-auto overflow-hidden rounded-(--r) border border-line bg-card/40 px-2 sm:px-4">
            <Landscape stage={stage} />
          </div>
          <figcaption className="mt-2 text-center text-xs text-mute max-sm:block sm:sr-only">Illustration: a metaphor for the path, not a system diagram.</figcaption>
        </figure>
        <div className="mt-2 max-sm:hidden"><Stations stage={stage} /></div>
      </div>
      <div className="sticky top-14 z-10 -mx-5 mt-6 border-b border-line bg-bg/95 px-5 py-2 backdrop-blur-sm sm:hidden"><Stations stage={stage} /></div>
      <ol className="relative ml-2 mt-6 border-l border-line">
        {chapters.map((c, i) => (
          <li key={c.year + c.title} ref={el => { items.current[i] = el }} data-i={i} className="relative pb-12 pl-7 last:pb-0 sm:pl-9">
            <Dot on={i <= current} seed={50 + i} />
            <p className="eyebrow flex flex-wrap items-center gap-x-2">
              <span className="text-fg">{c.year}</span>
              <span aria-hidden="true">·</span>
              <span className={c.kind === 'Direction' ? 'text-accent' : ''}>{c.kind === 'Direction' ? '▸ next, not done yet' : c.kind}</span>
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-1 text-sm text-mute">{c.org}</p>
            <ul className="mt-3 space-y-1.5 text-[0.9375rem] leading-relaxed text-soft">{c.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function App() {
  useReveal()
  const prefs = usePrefs()
  usePauseOffscreen()
  useHashLinks()
  const [lead, ...clauses] = intro.tagline
  return (
    <>
      <SkipLink />
      <Nav />
      <ScrollLine />
      <main id="main" tabIndex={-1} className="relative mx-auto max-w-[40rem] px-5 outline-none" data-theme-now={prefs.theme}>
        <section id="top" aria-labelledby="hero-title" className="pb-24 pt-16 sm:pt-24">
          <div className="rise flex items-center gap-4">
            <p className="text-sm text-mute">
              <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-live align-middle" />
              {intro.now} · {site.location}
            </p>
          </div>
          <div className="mt-7"><Portrait /></div>
          <div data-reveal className="mt-7">
            <h1 id="hero-title" className="font-display text-[clamp(2.75rem,10vw,4.5rem)] font-semibold leading-[.98] tracking-[-.035em]">
              <span className="sr-only">{site.name}</span>
              <span aria-hidden="true" className="wave-u">
                {[...site.name].map((ch, k) => ch === ' '
                  ? <span key={k}> </span>
                  : <span key={k} className="ltr ltr-in" style={{ '--i': k } as CSSProperties}>{ch}</span>)}
                <Wave />
              </span>
            </h1>
          </div>
          <p className="rise mt-8 font-display text-[clamp(1.5rem,5vw,2rem)] font-medium leading-[1.2] tracking-tight" style={{ ['--d' as string]: '200ms' }}>
            {lead} <span className="text-mute">{clauses[0]}</span> <span className="text-mute">{clauses[1]}</span> <span className="text-accent">{clauses[2]}</span>
          </p>
          <p className="rise mt-6 text-[1.0625rem] leading-relaxed text-soft" style={{ ['--d' as string]: '300ms' }}>{intro.summary}</p>
          <div className="rise mt-7 flex flex-wrap items-center gap-x-3 gap-y-3" style={{ ['--d' as string]: '400ms' }}>
            <Sketched as="span" seed={21} pad={4} rad={10}><a href="#work" className="btn btn-primary">View projects <span aria-hidden="true" className="btn-arrow">→</span></a></Sketched>
            <Sketched as="span" seed={22} pad={4} rad={10}><a href="#lab" className="btn btn-secondary">Open the Lab <span aria-hidden="true" className="btn-arrow">→</span></a></Sketched>
            <a href="#journey" className="p-link inline-block py-1.5 text-sm text-soft sm:ml-1">or start the journey</a>
          </div>
          <ul aria-label="Elsewhere" className="rise mt-5 flex flex-wrap gap-x-5 gap-y-0 text-[0.9375rem]" style={{ ['--d' as string]: '460ms' }}>
            <li><a href={site.github} target="_blank" rel="noopener noreferrer" className="p-link inline-block py-1">GitHub<span aria-hidden="true" className="nudge text-mute"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a></li>
            <li><a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="p-link inline-block py-1">LinkedIn<span aria-hidden="true" className="nudge text-mute"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a></li>
            <li><a href={site.resume} className="p-link inline-block py-1">Résumé</a></li>
            <li><a href={`mailto:${site.email}`} className="p-link inline-block py-1">Email</a></li>
          </ul>
          <div data-loop data-reveal className="mt-12">
            <Sketched when="view" seed={41} pad={6} rad={14}><SignalFigure /></Sketched>
          </div>
        </section>

        <section id="work" aria-labelledby="work-title" className="scroll-mt-16 pb-20">
          <Heading id="work-title">Selected work</Heading>
          <p data-reveal className="mt-4 text-mute">Click a card to read the problem, what I built, and the evidence. Scroll inside it for the rest.</p>
          <ul aria-label="Projects" className="mb-14 mt-9 grid gap-6 sm:grid-cols-2 sm:gap-7">{projects.map((p, i) => <Entry key={p.id} p={p} i={i} />)}</ul>
          <div data-reveal>
            <h3 className="font-mono text-xs text-mute">Also, smaller things</h3>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2">
              {moreWork.map((w, i) => (
                <li key={w.title} className="list-none">
                  <Sketched seed={71 + i * 5} className="h-full">
                    <a href={w.href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col gap-1.5 rounded-(--r) border border-line bg-card p-4 transition-colors hover:border-line-strong">
                      <span className="font-display text-lg font-semibold tracking-tight">{w.title} ↗<span className="sr-only"> (opens in a new tab)</span></span>
                      <span className="text-sm leading-relaxed text-soft">{w.body}</span>
                      <span className="mt-auto pt-1 font-mono text-xs text-mute">{w.context} · notebook</span>
                    </a>
                  </Sketched>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Journey />

        <section id="lab" aria-labelledby="lab-title" className="scroll-mt-16 pb-20">
          <Heading id="lab-title">Lab</Heading>
          <p data-reveal className="mt-4 text-mute">Small interactive experiments. Open one to try it.</p>
          <LabList />
        </section>

        <section id="about" aria-labelledby="about-title" className="scroll-mt-16 pb-20">
          <Heading id="about-title">About</Heading>
          <p data-reveal className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight">
            Two and a half years of SQL and billing systems at TCS, then a move into AI: retrieval, computer vision and speech recognition.
          </p>
          <dl data-reveal className="mt-8 space-y-3">
            {now.map(n => (
              <div key={n.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
                <dt className="font-mono text-xs leading-6 text-accent">{n.label}</dt>
                <dd className="text-soft">{n.text}</dd>
              </div>
            ))}
          </dl>
          <div data-reveal className="mt-10">
            <h3 className="font-mono text-xs text-mute">Education</h3>
            <ul className="mt-3 space-y-3">
              {education.map(e => (
                <li key={e.org}>
                  <p className="font-medium">{e.org} <span className="font-mono text-xs font-normal text-mute">· {e.when}</span></p>
                  <p className="text-sm text-soft">{e.role}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-mute">Certifications: {certifications.join(' · ')}</p>
          </div>
          <div data-reveal className="mt-10">
            <h3 className="font-mono text-xs text-mute">Stack</h3>
            <dl className="mt-3 space-y-2 text-[0.9375rem]">
              {skillGroups.map(g => (
                <div key={g.name} className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)]">
                  <dt className="text-mute">{g.name}</dt>
                  <dd className="text-soft">{g.items.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-16 pb-24">
          <Heading id="contact-title">Let’s talk</Heading>
          <p data-reveal className="mt-6 text-soft">Email is the quickest way to reach me.</p>
          <Contact />
          <p data-reveal className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="p-link inline-block py-1">GitHub ↗</a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="p-link inline-block py-1">LinkedIn ↗</a>
            <a href={site.resume} className="p-link">Résumé (PDF)</a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
