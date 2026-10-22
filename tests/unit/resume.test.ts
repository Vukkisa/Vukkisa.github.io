/**
 * The résumé's source (resume/resume.html) must agree with the portfolio's verified facts in
 * app/src/data/content.ts, and the PDF the portfolio links to must exist where it links.
 * (The PDF's own text is checked by hand when it is regenerated: `npm run resume`.)
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { certifications, chapters, education, projects, site } from '../../app/src/data/content'

const html = readFileSync('resume/resume.html', 'utf8')
const text = html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')

describe('résumé source', () => {
  it('has the contact details and links from the site', () => {
    for (const s of [site.email, site.url, site.github, site.linkedin.replace('https://', '')]) expect(html).toContain(s)
  })

  it('states the same roles, organisations and dates as the Journey', () => {
    for (const title of ['Data Developer', 'Associate Data Scientist']) expect(chapters.some(c => c.title.startsWith(title))).toBe(true)
    expect(text).toMatch(/Associate Data Scientist Intern \| AiSpry Oct 2026 – Dec 2026/)
    expect(text).toMatch(/Data Developer \| Tata Consultancy Services \(TCS\), Hyderabad Sep 2023 – Apr 2026/)
    expect(chapters.find(c => c.title === 'Data Developer')!.org).toContain('Sep 2023 – Apr 2026')
    expect(chapters.find(c => c.title.startsWith('Associate'))!.org).toContain('Oct 2026 – Dec 2026')
  })

  it('keeps every TCS result the portfolio states, and no number it does not', () => {
    for (const fact of ['2M+ customer records', 'by 25%', 'by 40%', 'Star of the Month']) expect(text).toContain(fact)
    // Every percentage in the résumé is one of the verified ones.
    expect([...text.matchAll(/\d+(?:\.\d+)?%/g)].map(m => m[0]).sort()).toEqual(['25%', '40%'])
  })

  it('lists the education and certifications from the site', () => {
    expect(text).toContain('Apr 2026 – Apr 2027')
    expect(text).toContain('CGPA 8.17')
    expect(education.map(e => e.org)).toEqual(['Jio Institute', 'B.V. Raju Institute of Technology'])
    for (const org of education.map(e => e.org)) expect(text).toContain(org)
    expect(certifications.join(' ')).toMatch(/HackerRank/)
    expect(text).toMatch(/SQL \(Advanced\), HackerRank, 2023/)
    expect(text).toMatch(/Full Stack Developer \(Python\), TalentSprint, 2023/)
  })

  it('covers the portfolio projects, with public links only where the portfolio has them', () => {
    for (const p of projects) expect(text).toContain(p.title === 'Railway speech recognition' ? 'speech-recognition pipeline' : p.title)
    for (const l of projects.flatMap(p => p.links).filter(l => /KnowYourRules$|AI_Surveillance$|ez-learn/.test(l.href))) {
      expect(html).toContain(l.href.replace('https://', '').replace(/\/$/, ''))
    }
    // Evaluation is stated honestly: what hasn't been measured or can't be shared says so.
    expect(text).toMatch(/answer accuracy not yet evaluated/)
    expect(text).toMatch(/results not yet recorded/)
    expect(text).toMatch(/code, data and results are not public/)
  })

  it('stays ATS-friendly: one column, no tables, images or scripts', () => {
    expect(html).not.toMatch(/<(table|img|svg|canvas|script)\b/i)
  })
})

describe('résumé PDF', () => {
  const pdf = site.resume.replace(/^\//, '')
  it('exists at the path the portfolio links to, and is a real PDF', () => {
    expect(existsSync(pdf)).toBe(true)
    expect(readFileSync(pdf).subarray(0, 5).toString()).toBe('%PDF-')
    expect(statSync(pdf).size).toBeGreaterThan(10_000)
  })
})
