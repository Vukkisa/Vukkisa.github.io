/**
 * Social and search metadata in app/index.html (and the deployed copy at the root): the preview
 * image is an absolute URL on the GitHub Pages domain, points at a file that exists and is the
 * size the tags claim, and every tag that should agree does.
 */
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SITE = 'https://vukkisa.github.io/'

function meta(html: string) {
  const tags = new Map<string, string>()
  for (const m of html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"/g)) tags.set(m[1], m[2])
  return tags
}

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file: string) {
  const b = readFileSync(file)
  expect(b.subarray(1, 4).toString()).toBe('PNG')
  return [b.readUInt32BE(16), b.readUInt32BE(20)]
}

const files = ['app/index.html', ...(existsSync('index.html') ? ['index.html'] : [])]

describe.each(files)('metadata in %s', file => {
  const html = readFileSync(file, 'utf8')
  const tags = meta(html)

  it('uses absolute URLs on the deployment domain', () => {
    expect(html).toContain(`<link rel="canonical" href="${SITE}" />`)
    expect(tags.get('og:url')).toBe(SITE)
    for (const k of ['og:image', 'twitter:image']) expect(tags.get(k)).toBe(`${SITE}og.png`)
  })

  it('describes the preview image, which exists at the size it claims', () => {
    expect(pngSize('app/public/og.png')).toEqual([Number(tags.get('og:image:width')), Number(tags.get('og:image:height'))])
    expect(tags.get('og:image:type')).toBe('image/png')
    expect(tags.get('og:image:alt')).toMatch(/Jayanth Vukkisa/)
    expect(tags.get('twitter:image:alt')).toBe(tags.get('og:image:alt'))
    expect(tags.get('twitter:card')).toBe('summary_large_image')
  })

  it('keeps titles and descriptions in step', () => {
    expect(tags.get('twitter:title')).toBe(tags.get('og:title'))
    expect(tags.get('twitter:description')).toBe(tags.get('og:description'))
    expect(tags.get('description')!.length).toBeGreaterThan(50)
  })

  it('matches the dark default theme colour', () => {
    expect(tags.get('theme-color')).toBe('#0a0a0b')
    expect(JSON.parse(readFileSync('app/public/site.webmanifest', 'utf8')).theme_color).toBe('#0a0a0b')
  })
})

describe('deployed copies of the public files', () => {
  it('the root has the same preview image as app/public (the build copies it)', () => {
    if (!existsSync('og.png')) return
    expect(readFileSync('og.png').equals(readFileSync('app/public/og.png'))).toBe(true)
  })
  it('the sitemap lists the canonical URL', () => {
    expect(readFileSync('app/public/sitemap.xml', 'utf8')).toContain(`<loc>${SITE}</loc>`)
  })
})
