import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Thesis from './components/Thesis'
import Beliefs from './components/Beliefs'
import Process from './components/Process'
import Showcase from './components/Showcase'
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

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => observer.observe(el))
    }

    observeAll()

    const mutationObserver = new MutationObserver(observeAll)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <>
      <Navbar />
      <Hero />
      <Thesis />
      <Beliefs />
      <Process />
      <Showcase />
      <Waitlist />
      <Footer />
    </>
  )
}
