import { AnswerDemo } from '../components/AnswerDemo'
import { ProjectStory } from '../components/ProjectStory'
import { Section } from '../components/ui/Section'
import { ZoneDemo } from '../components/ZoneDemo'
import { projects } from '../data/content'

export function Builds() {
  const [kyr, cv, ez] = projects
  return (
    <Section
      id="builds"
      path="~/builds"
      title={<>Things I build<span className="text-amber">.</span></>}
      intro="Three projects, explained the way I'd explain them to a friend: why it exists, how it works, and which decisions actually mattered. Hover or tap any stage of a pipeline."
    >
      <div className="space-y-32 sm:space-y-40">
        <ProjectStory project={kyr} pipelineExtra={i => (i === kyr.pipeline.length - 1 ? <AnswerDemo /> : null)} />
        <ProjectStory project={cv} demo={<ZoneDemo />} />
        <ProjectStory project={ez} />
      </div>
    </Section>
  )
}
