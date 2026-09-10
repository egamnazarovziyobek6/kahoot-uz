import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Features from '../components/Features.jsx'
import Characters from '../components/Characters.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import QuizShowcase from '../components/QuizShowcase.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import Footer from '../components/Footer.jsx'
import NaqshDivider from '../components/decor/NaqshDivider.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <NaqshDivider />
        <Features />
        <Characters />
        <HowItWorks />
        <NaqshDivider flip />
        <QuizShowcase />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
