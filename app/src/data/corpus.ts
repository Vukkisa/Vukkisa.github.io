import { chapters, projects } from './content'
import type { Doc } from '../lib/rag'

/**
 * The documents for the Lab's RAG experiment: this site's own project and journey text, so the
 * experiment retrieves real content rather than invented documents.
 */
export const siteDocs: Doc[] = [
  ...projects.map(p => ({
    id: p.id,
    title: p.title,
    text: [
      `${p.title}: ${p.subtitle}.`, p.problem, p.built, p.evidence,
      ...p.caseStudy.steps.map(s => `${s.name}: ${s.detail}`),
      ...p.caseStudy.mine, p.caseStudy.evaluation, ...p.caseStudy.limitations,
    ].join(' '),
  })),
  ...chapters.map((c, i) => ({
    id: `journey-${i + 1}`,
    title: `Journey · ${c.title}`,
    text: [`${c.title}, ${c.org} (${c.year}).`, ...c.points].join(' '),
  })),
]
