import { Footer, SkipLink } from './components/layout/Chrome'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Intro } from './sections/Intro'
import { Projects } from './sections/Projects'

export default function App() {
  return (
    <>
      <SkipLink />
      <div className="mx-auto max-w-2xl px-5 pb-10 pt-8 sm:px-6 sm:pt-12">
        <Intro />
        <main id="main" tabIndex={-1} className="outline-none">
          <Projects />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
