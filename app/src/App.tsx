import { Footer, SkipLink } from './components/layout/Chrome'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Intro } from './sections/Intro'
import { Projects } from './sections/Projects'
import { useReveal } from './hooks/useReveal'

export default function App() {
  useReveal()
  return (
    <>
      <SkipLink />
      {/* One column on phones and tablets. From lg up, the intro sits in a sticky left column and the
          work scrolls on the right, so wide screens aren't mostly empty margin. */}
      <div className="mx-auto max-w-2xl px-5 pb-10 pt-8 sm:px-6 sm:pt-12 lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-x-20 lg:px-10 lg:py-0">
        <Intro />
        <div className="lg:pb-20 lg:pt-[5.5rem]">
          <main id="main" tabIndex={-1} className="outline-none">
            <Projects />
            <Experience />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
