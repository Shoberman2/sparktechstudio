import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Showcase from './components/Showcase'
import HowItWorks from './components/HowItWorks'
import Beliefs from './components/Beliefs'
import Hiring from './components/Hiring'
import Waitlist from './components/Waitlist'
import Footer from './components/Footer'

export default function App() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Showcase />
      <HowItWorks />
      <Beliefs />
      <Hiring />
      <Waitlist />
      <Footer />
    </>
  )
}
