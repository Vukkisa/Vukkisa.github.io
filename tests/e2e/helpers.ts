import type { Page } from '@playwright/test'

export type StoredPrefs = Partial<Record<'theme' | 'text' | 'accent' | 'type' | 'density' | 'radius', string>>

/** Store preferences before the page loads, the way a returning visitor's browser would. */
export async function setPrefs(page: Page, prefs: StoredPrefs) {
  await page.addInitScript(p => localStorage.setItem('prefs', JSON.stringify(p)), prefs)
}

/** Collect console errors and uncaught exceptions for the life of the page. */
export function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('requestfailed', r => errors.push(`requestfailed: ${r.url()}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`) })
  return errors
}

/** Infinite (looping) animations, and whether each is currently running. */
export function loopingAnimations(page: Page) {
  return page.evaluate(() =>
    document.getAnimations()
      .filter(a => a.effect?.getTiming().iterations === Infinity)
      .map(a => ({ name: (a as CSSAnimation).animationName, state: a.playState })),
  )
}

/** Scroll instantly (no smooth scrolling), so tests don't race the animation. */
export async function scrollToY(page: Page, y: number) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y)
}

/** Put an element's top just above the middle of the viewport. */
export async function scrollToMiddle(page: Page, selector: string) {
  await page.evaluate(sel => {
    const el = document.querySelector(sel)
    if (!el) throw new Error(`no element ${sel}`)
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.47, behavior: 'instant' })
  }, selector)
}
