import Header from './components/Header'
import Hero from './sections/Hero'
import Portfolio from './sections/Portfolio'
import Types from './sections/Types'
import WhyUs from './sections/WhyUs'
import Process from './sections/Process'
import Benefits from './sections/Benefits'
import CTA from './sections/CTA'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import Thanks from './sections/Thanks'

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Types />
        <WhyUs />
        <Process />
        <Benefits />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
