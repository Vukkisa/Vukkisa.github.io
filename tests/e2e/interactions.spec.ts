import { expect, test } from '@playwright/test'
import { scrollToMiddle, setPrefs } from './helpers'

test.describe('command menu', () => {
  test('opens with Ctrl+K and "/", filters, and Enter goes to the result and focuses it', async ({ page }) => {
    await page.goto('/')
    const dialog = page.getByRole('dialog', { name: 'Command menu' })
    await page.keyboard.press('Control+k')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('combobox')).toBeFocused()
    await page.keyboard.type('zone check')
    await expect(page.getByRole('option')).toHaveText(['Try the zone check'])
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(page.locator('#lab-zone')).toBeFocused()

    await page.keyboard.press('/')
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('arrow keys move the selection and wrap around', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    const selected = page.locator('[role=option][aria-selected=true]')
    await expect(selected).toHaveText('Home')
    await page.keyboard.press('ArrowDown')
    await expect(selected).toHaveText('Selected work')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(selected).toContainText('Ez-Learn live demo')
  })

  test('preferences run without closing the menu', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('light')
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible()
  })
})

test.describe('preferences', () => {
  test('dark by default; the theme button switches and the choice survives a reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('a saved theme is applied before the app script runs (no flash)', async ({ page }) => {
    await setPrefs(page, { theme: 'light', accent: 'rose' })
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        ;(window as unknown as { __early: string }).__early = `${document.documentElement.dataset.theme}/${document.documentElement.dataset.accent}`
      })
    })
    await page.goto('/')
    expect(await page.evaluate(() => (window as unknown as { __early: string }).__early)).toBe('light/rose')
  })

  test('the larger-text button is a toggle that persists', async ({ page }) => {
    await page.goto('/')
    const aa = page.getByRole('button', { name: 'Larger text' })
    await expect(aa).toHaveAttribute('aria-pressed', 'false')
    await aa.click()
    await expect(aa).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-text', 'lg')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-text', 'lg')
  })

  test('design tokens restyle the page and reset', async ({ page }) => {
    await page.goto('/')
    const tokens = page.locator('#lab-tokens')
    await tokens.locator('label', { hasText: 'Ember' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'ember')
    await tokens.locator('label', { hasText: 'Square' }).click()
    expect(await tokens.evaluate(e => getComputedStyle(e).borderTopLeftRadius)).toBe('0px')
    await tokens.getByRole('button', { name: 'Reset' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'cobalt')
    await expect(page.locator('html')).toHaveAttribute('data-radius', 'soft')
  })
})

test.describe('lab', () => {
  test('RAG explainer: arrow keys move between stages and the panel follows', async ({ page }) => {
    await page.goto('/')
    const tabs = page.locator('#lab-rag').getByRole('tab')
    await tabs.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(1)).toBeFocused()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#lab-rag').getByRole('tabpanel')).toContainText('nomic-embed-text')
    await page.keyboard.press('End')
    await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true')
  })

  test('zone check: moving the person into the zone raises an intrusion and logs it', async ({ page }) => {
    await page.goto('/')
    const zone = page.locator('#lab-zone')
    const status = zone.locator('[aria-live]').first()
    await expect(status).toContainText('clear')
    await zone.getByRole('button', { name: /^Person/ }).focus()
    for (let i = 0; i < 6; i++) await page.keyboard.press('Shift+ArrowRight')
    await expect(status).toContainText('intrusion')
    await expect(zone.getByRole('button', { name: /^Person/ })).toHaveAttribute('aria-label', /Inside the zone/)
    await expect(zone).toContainText(/\d\d:\d\d:\d\d\s+intrusion/)
    await zone.getByRole('button', { name: 'Reset' }).click()
    await expect(status).toContainText('clear')
  })

  test('zone check: dragging a corner with the pointer moves it', async ({ page }) => {
    await page.goto('/')
    const corner = page.locator('#lab-zone').getByRole('button', { name: /^Zone corner 1/ })
    await corner.scrollIntoViewIfNeeded()
    const box = (await corner.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x - 40, box.y + 30, { steps: 5 })
    await page.mouse.up()
    await expect(corner).not.toHaveAttribute('aria-label', 'Zone corner 1 of 4, at 205, 95')
  })
})

test.describe('navigation', () => {
  test('the journey illustration follows the chapter being read', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await scrollToMiddle(page, '#journey li[data-i="4"]')
    await expect(page.locator('#journey [aria-current=step]')).toContainText('Retrieval')
    await scrollToMiddle(page, '#journey li[data-i="2"]')
    await expect(page.locator('#journey [aria-current=step]')).toContainText('Processing')
  })

  test('the top bar marks the section being read', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('lab')!.offsetTop, behavior: 'instant' }))
    await expect(page.locator('nav[aria-label=Sections] [aria-current=location]')).toContainText('lab')
  })

  test('copy email shows a confirmation', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await page.getByRole('button', { name: 'Copy email address' }).click()
    await expect(page.locator('#contact [aria-live]')).toContainText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('vukkisajayanth@gmail.com')
  })

  test('journey keeps the career content that is shown today', async ({ page }) => {
    await page.goto('/')
    const journey = page.locator('#journey')
    for (const text of ['Data Developer', 'Kenan billing migration of 2M+ customer records', 'improving processing speed by 25%',
      'cutting manual validation time by 40%', 'Star of the Month', 'Associate Data Scientist (internship)', 'AiSpry · Oct 2026 – Dec 2026',
      'PG Program in AI & Data Science', 'B.Tech, Computer Science & Engineering']) {
      await expect(journey).toContainText(text)
    }
    await expect(page.getByText('Associate Data Scientist intern at AiSpry').first()).toBeVisible()
  })
})
