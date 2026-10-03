import { LazyMotion, MotionConfig } from 'framer-motion'
import { Footer, SkipLink } from './components/layout/Chrome'
import { Header } from './components/layout/Header'
import { JourneyRail } from './components/layout/JourneyRail'
import { Builds } from './sections/Builds'
import { Contact } from './sections/Contact'
import { Evolution } from './sections/Evolution'
import { Hero } from './sections/Hero'
import { Lab } from './sections/Lab'
import { Lessons } from './sections/Lessons'
import { Next } from './sections/Next'
import { Obsessions } from './sections/Obsessions'
import { ShortVersion } from './sections/ShortVersion'
import { Toolbox } from './sections/Toolbox'

const loadFeatures = () => import('./lib/motionFeatures').then(m => m.default)

export default function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <Header />
        <JourneyRail />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <ShortVersion />
          <Evolution />
          <Builds />
          <Obsessions />
          <Lab />
          <Toolbox />
          <Lessons />
          <Next />
          <Contact />
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  )
}
