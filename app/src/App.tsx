import { LazyMotion, MotionConfig } from 'framer-motion'
import { Footer, SkipLink } from './components/layout/Chrome'
import { Header } from './components/layout/Header'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Journey } from './sections/Journey'
import { Work } from './sections/Work'

const loadFeatures = () => import('./lib/motionFeatures').then(m => m.default)

export default function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Work />
          <Journey />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  )
}
