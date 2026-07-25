import { useEffect, useState } from 'react'
import './Navbar.css'

// The nav is a paper strip, so over the dark hero it reads as a stray bar.
// Keep it off the first view and drop it in once the user scrolls off the hero.
const SHOW_AFTER = 80

export default function Navbar() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > SHOW_AFTER)
    onScroll() // handle a reload that restores mid-page scroll
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={shown ? 'nav-shown' : ''}>
      <div className="nav-inner">
        <div className="nav-left">
          <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
          <a href="#" className="logo">
            <img src="/logo.svg" alt="SparkTech Studio" className="logo-icon" />
            <span className="logo-text">sparktech<span className="logo-text-suffix">-studio</span><span className="logo-caret" aria-hidden="true" /></span>
          </a>
        </div>
        <ul className="nav-links">
          <li><a href="#thesis">./thesis</a></li>
          <li><a href="#about">./about</a></li>
          <li><a href="#process">./process</a></li>
          <li><a href="#portfolio">./work</a></li>
        </ul>
        <div className="nav-right">
          {/* Two labels so the phone can keep the full wordmark: the long CTA
              and "sparktech-studio" cannot both fit 375px. */}
          <a href="#waitlist" className="nav-cta">
            <span className="nav-cta-long">[ start_a_project ]</span>
            <span className="nav-cta-short">[ start ]</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
