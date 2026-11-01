import { useEffect, useState } from 'react'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/500.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import './theme.css'
import { BOOK } from '../designs/content.jsx'
import { pricing, serviceList, products, replyNote } from './facts.js'
import Assistant from './Assistant.jsx'

const BOLT = '/brand/sparktech-bolt-128.png'
const LINKS = [['Services', '/services'], ['AI agents', '/services/ai-agents'], ['Work', '/work'], ['Pricing', '/pricing']]

export const Book = ({ className = 'btn' }) => <a className={className} {...BOOK}>Book a call</a>

// Fade-up on scroll. Elements already on screen are marked before <html> gets the class, so nothing flashes.
function useReveal(key) {
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal:not(.in)')]
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const vh = window.innerHeight
    els.forEach(e => { if (e.getBoundingClientRect().top < vh * 0.92) e.classList.add('in') })
    document.documentElement.classList.add('rv')
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }), { rootMargin: '0px 0px -8% 0px' })
    els.forEach(e => { if (!e.classList.contains('in')) io.observe(e) })
    return () => io.disconnect()
  }, [key])
}

function Nav({ path }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])
  const cur = href => (path === href || (path.startsWith(href + '/') && !LINKS.some(([, h]) => h !== href && path.startsWith(h)))) ? 'page' : undefined
  // The sheet sits outside the header: the header's backdrop-filter would otherwise trap a fixed child inside its 68px box
  return <>
  <header className="nav">
    <div className="nav-in">
      <a href="/" className="mark" aria-label="SparkTech Studio home"><img src={BOLT} width="26" height="25" alt="" />SparkTech Studio</a>
      <nav className="nav-links" aria-label="Main">{LINKS.map(([t, h]) => <a key={h} href={h} aria-current={cur(h)}>{t}</a>)}</nav>
      <Book className="btn btn-sm nav-cta" />
      <button className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>Menu</button>
    </div>
  </header>
    {open && <div className="sheet" id="menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="sheet-top">
        <a href="/" className="mark" onClick={() => setOpen(false)}><img src={BOLT} width="26" height="25" alt="" />SparkTech Studio</a>
        <button className="menu-btn" aria-expanded="true" aria-controls="menu" onClick={() => setOpen(false)} autoFocus>Close</button>
      </div>
      <nav aria-label="Menu">{[['Home', '/'], ...LINKS].map(([t, h]) => <a key={h} href={h} aria-current={cur(h)} onClick={() => setOpen(false)}>{t}</a>)}</nav>
      <Book />
    </div>}
  </>
}

const cols = [
  ['Services', [['All services', '/services'], ...serviceList.map(([t, h]) => [t, h])]],
  ['Work', [['All work', '/work'], ...products.map(p => [p.name, `/work/${p.slug}`])]],
  ['Studio', [['Pricing', '/pricing'], ['Partners', '/partners'], ['Privacy', '/privacy']]],
]

function Footer() {
  return <footer className="foot">
    <div className="wrap">
      <div className="foot-top">
        <div>
          <a href="/" className="mark"><img src={BOLT} width="26" height="25" alt="" />SparkTech Studio</a>
          <p>Websites and AI agents. New York.</p>
        </div>
        <Book />
      </div>
      <div className="foot-cols">{cols.map(([h, links]) => <div key={h}>
        <h3>{h}</h3>
        <ul>{links.map(([t, href]) => <li key={href}><a href={href}>{t}</a></li>)}</ul>
      </div>)}</div>
      <p className="foot-legal">© 2026 SparkTech Studios, Inc. · Not affiliated with sparktechstudios.com (Ontario)</p>
    </div>
  </footer>
}

export function Shell({ path, title, children, band = true }) {
  useEffect(() => { if (title) document.title = title }, [title])
  useReveal(path)
  return <div className="b">
    <Nav path={path} />
    <main id="main">{children}</main>
    {band && <CtaBand />}
    <Footer />
    <Assistant />
  </div>
}

export function CtaBand() {
  return <section className="band">
    <div className="wrap reveal">
      <h2>Let's Build Yours</h2>
      <p>{replyNote}</p>
      <div className="actions"><Book /></div>
    </div>
  </section>
}

// Structured data rendered into the page so the prerendered HTML carries it
export const JsonLd = ({ data }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />

// ---------- Devices ----------
export function Laptop({ src, alt, eager }) {
  return <div className="laptop">
    <div className="laptop-lid"><div className="laptop-screen"><img src={src} alt={alt} width="1600" height="1000" loading={eager ? 'eager' : 'lazy'} decoding="async" /></div></div>
    <div className="laptop-base" aria-hidden="true" />
  </div>
}

// Status bar colors follow each site's own top edge, so the screenshot never sits under the island
const statusInk = { ballotwatch: ['#fafaf7', '#000'], utern: ['#ffffff', '#000'], leed: ['#010101', '#fff'], validate: ['#f7f6f3', '#000'], oasis: ['#090d1b', '#fff'] }
export function Phone({ slug, src, alt, eager }) {
  const [bg, ink] = statusInk[slug] || ['#fff', '#000']
  return <div className="phone">
    <div className="phone-body">
      <div className="phone-screen" style={{ '--sb': bg, '--sb-ink': ink }}>
        <div className="phone-status" aria-hidden="true">
          <span>9:41</span>
          <span className="phone-bars">{[35, 50, 65, 80].map(h => <i key={h} style={{ height: `${h / 30}cqw` }} />)}<span className="phone-batt" /></span>
        </div>
        <span className="phone-island" aria-hidden="true" />
        <img src={src} alt={alt} width="780" height="1688" loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    </div>
  </div>
}



export function Prices({ keys = ['launch', 'updates', 'care', 'growth'], scopes = {}, short = false }) {
  return <div className={`prices reveal ${keys.length === 4 ? 'prices-4' : keys.length === 2 ? 'prices-2' : keys.length === 1 ? 'prices-1' : ''}${short ? ' prices-short' : ''}`}>{keys.map(k => { const p = pricing[k]; return <div className="price" key={k}>
    <h3>{p.name}</h3>
    <div className="amt">{p.price}<span className="unit">{p.unit}</span></div>
    {!short && <p className="scope">{scopes[k] || p.scope}</p>}
  </div> })}</div>
}

// One row per service: name and one plain line
export function ServiceList({ skip, items = serviceList }) {
  return <ul className="svc-list">{items.filter(([, h]) => h !== skip).map(([t, h, line]) => <li key={t} className="reveal">
    <a href={h}><h3>{t}</h3><p>{line}</p></a>
  </li>)}</ul>
}

export function Head({ h1, lede, cta = true }) {
  return <section className="head wrap">
    <h1>{h1}</h1>
    {lede && <p className="lede">{lede}</p>}
    {cta && <div className="actions"><Book /></div>}
  </section>
}
