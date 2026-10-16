import { Footer, SkipLink } from './components/layout/Chrome'
import { TopBar } from './components/TopBar'
import { useReveal } from './hooks/useReveal'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Hero } from './sections/Hero'
import { Journey } from './sections/Journey'
import { Lab } from './sections/Lab'
import { Work } from './sections/Work'

export default function App() {
  useReveal()
  return (
    <>
      <SkipLink />
      <TopBar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-5 outline-none sm:px-6 lg:px-10">
        <Hero />
        <Work />
        <Journey />
        <Lab />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
