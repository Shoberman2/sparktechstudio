import { useEffect, useState } from 'react'
import { built, EMAIL, BOOK, year } from './content.jsx'
import { services, industry, locations } from './pages.jsx'

// The shell every page shares: the nav (with a full-screen menu on small screens), the page, the footer.
export const SITE = 'https://www.sparktechstudio.com'
export const ORG = `${SITE}/#org`

const links = [['Services', '/services'], ['Work', '/work'], ['Partners', '/partners'], ['System', '/systems'], ['Contact', '#contact']]

export const Mark = () => <img className="mark-img" src="/brand/sparktech-bolt-mark.png" width="28" height="28" alt="" />

export function Nav() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const key = e => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [open])
  return <>
  <header className="nav">
    <div className="wrap nav-in">
      <a href="/" className="brand" onClick={() => setOpen(false)}><Mark /><span>SparkTech Studio</span></a>
      <nav className="nav-links" aria-label="Main">
        {links.map(([t, h]) => <a key={h} href={h}>{t}</a>)}
      </nav>
      <a className="btn btn-primary btn-sm nav-cta" {...BOOK}>Book a call</a>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Menu'}</button>
    </div>
  </header>
  <div id="menu" className="menu" hidden={!open}>
      <nav className="wrap" aria-label="Menu">
        {links.map(([t, h]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        <a className="btn btn-primary" {...BOOK} onClick={() => setOpen(false)}>Book a call</a>
      </nav>
  </div>
  </>
}

export function Footer() {
  return <footer className="foot" id="contact">
    <div className="wrap">
      <div className="foot-cta">
        <h2>What should exist next?</h2>
        <p className="lede">Tell us. Book a call or email us, and we reply within two business days.</p>
        <div className="actions">
          <a className="btn btn-primary" {...BOOK}>Book a call</a>
          <a className="btn btn-line" href={`mailto:${EMAIL}`}>Email us</a>
        </div>
      </div>
      <div className="foot-grid">
        <div className="foot-brand">
          <a href="/" className="brand"><Mark /><span>SparkTech Studio</span></a>
          <p>An independent studio in New York, NY.</p>
        </div>
        <nav aria-label="Services"><p className="foot-h">Services</p>{services.map(s => <a key={s.slug} href={s.path}>{s.nav}</a>)}<a href={industry.path}>Law, finance and medical</a></nav>
        <nav aria-label="Work"><p className="foot-h">Work</p><a href="/work">All work</a>{built.map(b => <a key={b.slug} href={b.url}>{b.name}</a>)}</nav>
        <nav aria-label="Studio"><p className="foot-h">Studio</p><a href="/partners">Partners</a><a href="/systems">System</a><a href="/pricing">Pricing</a><a {...BOOK}>Book a call</a><a href={`mailto:${EMAIL}`}>Email us</a></nav>
      </div>
      <nav className="foot-places" aria-label="Where we work">{locations.map(l => <a key={l.slug} href={l.path}>{l.place}</a>)}</nav>
      <div className="foot-legal"><span>© {year} SparkTech Studios, Inc. · Not affiliated with sparktechstudios.com (Ontario)</span><a href="/privacy">Privacy</a></div>
    </div>
  </footer>
}

export function Shell({ title, children }) {
  useEffect(() => { document.title = title }, [title])
  useEffect(() => { if (window.location.hash === '') window.scrollTo(0, 0) }, [title])
  return <div className="site">
    <a className="skip" href="#main">Skip to content</a>
    <Nav />
    <main id="main">{children}</main>
    <Footer />
  </div>
}

// Page opening: a big heading, one short paragraph, the two buttons
export function Head({ h1, lede, cta = true, children }) {
  return <section className="head wrap">
    <h1>{h1}</h1>
    {lede && <p className="lede">{lede}</p>}
    {cta && <div className="actions">
      <a className="btn btn-primary" {...BOOK}>Book a call</a>
      <a className="btn btn-line" href="/work">See the work</a>
    </div>}
    {children}
  </section>
}

export function Section({ title, intro, children, id, className = '' }) {
  return <section className={`sec wrap ${className}`} id={id}>
    {title && <div className="sec-head"><h2>{title}</h2>{intro && <p className="lede">{intro}</p>}</div>}
    {children}
  </section>
}

// Structured data rendered into the page itself, so the prerendered HTML carries it
export const JsonLd = ({ data }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
