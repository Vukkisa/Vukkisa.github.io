import { describe, expect, it } from 'vitest'
import { projects } from '../../app/src/data/content'

describe('project case studies', () => {
  it.each(projects.map(p => [p.id, p] as const))('%s has a complete, honest case study', (_, p) => {
    const c = p.caseStudy
    expect(c.steps.length).toBeGreaterThanOrEqual(4)
    for (const s of c.steps) { expect(s.name).toBeTruthy(); expect(s.detail.length).toBeGreaterThan(20) }
    expect(c.mine.length).toBeGreaterThan(0)
    expect(c.limitations.length).toBeGreaterThan(0)
    expect(c.evaluation.length).toBeGreaterThan(20)
    // Evaluation never invents a number: no percentages, scores or speeds.
    expect(c.evaluation).not.toMatch(/\d+(\.\d+)?\s?(%|fps|ms|x\b)/i)
  })

  it('the three AI projects have a diagram', () => {
    expect(Object.fromEntries(projects.map(p => [p.id, p.visual ?? null]))).toEqual({
      knowyourrules: 'rag', 'ai-surveillance': 'cv', 'speech-recognition': 'speech', 'ez-learn': null,
    })
  })

  it('a project without public links says why', () => {
    for (const p of projects) expect(p.links.length > 0 || !!p.privateNote, p.id).toBe(true)
  })
})
