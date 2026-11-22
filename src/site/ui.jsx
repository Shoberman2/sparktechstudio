import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import { BOOK, EMAIL } from '../designs/content.jsx'
import { pricing, products, SOCIALS, serviceList } from './facts.js'
import './site.css'

// Shared pieces for every page of Direction A (Spark Cloud). One button, one nav, one footer, one closing band.
// Services and Pricing are sections of the home page (the wheel and the subscription), not pages of their own
const LINKS = [['services', '/#services', 'Services'], ['pricing', '/#pricing', 'Pricing'], ['grader', '/grader', 'SEO checker']]

// `from` names where the button sits, so analytics can tell which Book a call gets used
// data-from also tells src/lib/booking.js where a finished booking started (call_booked)
export const Book = ({ className = '', from = 'page', label = 'Book a call' }) => <a className={`btn ${className}`.trim()} {...BOOK} data-from={from} onClick={() => track('book_call', { from })}>{label}</a>

export const JsonLd = ({ data }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />

function Brand() {
  return <a href="/" className="brand"><img src="/favicon-tab.svg" width="26" height="26" alt="" /><span>SparkTech Studios</span></a>
}

function Nav({ active }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const btn = useRef(null)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const key = e => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = '' }
  }, [open])
  return <header className={`nav${solid ? ' solid' : ''}`}>
    <div className="nav-in">
      <Brand />
      <nav className="nav-links" aria-label="Main">
        {LINKS.map(([k, href, label]) => <a key={k} href={href} aria-current={active === k ? 'page' : undefined}>{label}</a>)}
      </nav>
      <Book className="sm" from="nav" />
      <button ref={btn} type="button" className="menu-btn" aria-expanded={open} aria-controls="menu-sheet" onClick={() => setOpen(true)}>Menu</button>
    </div>
    {open && <div className="sheet" id="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="sheet-top"><Brand /><button type="button" className="menu-btn" autoFocus onClick={() => { setOpen(false); btn.current?.focus() }}>Close</button></div>
      <nav aria-label="Main">
        <a href="/" onClick={() => setOpen(false)}>Home</a>
        {LINKS.map(([k, href, label]) => <a key={k} href={href} aria-current={active === k ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <Book from="menu" />
    </div>}
  </header>
}

// Footer (2026-11-21): every page on the site is linked here, set in the nav's type. No button and no tagline (founder).
// Four columns: Services (each service page), Studio, Contact, Legal (Privacy, Terms, Sitemap); then the logo with ©, centered.
// 2026-11-22: the "What we do" column (each service jumping to its place on the home reel) is merged into Services: it listed
// the same services again, and every one has its own page. The reel still answers /#seo, /#apps and so on.
// One link per service page. "Website updates" and "Monthly care" share /services/retainers, so it is listed once.
const PAGES = serviceList.filter((s, i, all) => all.findIndex(x => x.path === s.path) === i)
function Footer() {
  return <footer className="ft">
    <div className="ft-wide ft-in reveal">
      <nav aria-label="Services"><h2>Services</h2><a href="/services">All services</a>{PAGES.map(s => <a key={s.path} href={s.path}>{s.nav}</a>)}</nav>
      <nav aria-label="Studio"><h2>Studio</h2><a href="/">Home</a><a href="/#pricing">Pricing</a><a href="/systems">System</a><a href="/grader">SEO checker</a><a href="/partners">Partners</a></nav>
      <nav aria-label="Contact"><h2>Contact</h2><a {...BOOK} data-from="footer-links" onClick={() => track('book_call', { from: 'footer-links' })}>Book a call</a><a href={`mailto:${EMAIL}`}>Email us</a>{SOCIALS.filter(x => x.url).map(x => <a key={x.name} href={x.url} target="_blank" rel="noreferrer me">{x.name}</a>)}</nav>
      <nav aria-label="Legal"><h2>Legal</h2><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/sitemap.xml">Sitemap</a></nav>
    </div>
    <div className="ft-wide ft-legal">
      <a href="/" className="ft-mark"><img src="/favicon-tab.svg" width="22" height="22" alt="" /><span>© {new Date().getFullYear()} SparkTech Studios, Inc.</span></a>
    </div>
  </footer>
}

// Closing band (2026-11-21): an outlined gold panel so the last call to action stands out. One statement, Book a call.
export function Band({ title = 'Have Something To Build?', line = 'Book a call or email us. We reply within two business days.' }) {
  return <section className="band" aria-label="Book a call">
    <div className="band-box reveal">
      <h2>{title}</h2>
      <p>{line}</p>
      <div className="actions"><Book className="lg" from="band" /><a className="btn ghost lg" href={`mailto:${EMAIL}`}>Email us</a></div>
    </div>
  </section>
}

// Fade-up on scroll. Anything already on screen is shown at once; only then does <html> get .rv, so nothing flashes.
function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll('.st .reveal:not(.in)')]
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(e => e.classList.add('in')); return }
    const vh = window.innerHeight
    els.forEach(e => { if (e.getBoundingClientRect().top < vh) e.classList.add('in') })
    document.documentElement.classList.add('rv')
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } }), { rootMargin: '0px 0px -8% 0px' })
    els.filter(e => !e.classList.contains('in')).forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])
}

export function Shell({ title, active, band = true, bandTitle, bandLine, className = '', children }) {
  useEffect(() => { document.title = title }, [title])
  useReveal()
  return <div className={`st st-dark ${className}`.trim()}>
    <a className="skip" href="#main">Skip to content</a>
    <Nav active={active} />
    <main id="main">{children}</main>
    {band && <Band title={bandTitle} line={bandLine} />}
    <Footer />
  </div>
}

export function PageHead({ h1, lede, cta = true, children }) {
  return <section className="phead">
    <div className="wrap">
      <h1>{h1}</h1>
      {lede && <p>{lede}</p>}
      {cta && <div className="actions"><Book /></div>}
      {children}
    </div>
  </section>
}

export function Sec({ title, line, children, id }) {
  return <section className="sec" id={id}>
    <div className="wrap">
      {title && <div className="head reveal"><h2>{title}</h2>{line && <p>{line}</p>}</div>}
      {children}
    </div>
  </section>
}

export const Shot = ({ slug, name, href }) => {
  const img = <img src={`/work/${slug}/og.jpg`} alt={`${name}, as it looks today`} width="1200" height="630" loading="lazy" decoding="async" />
  return href ? <a className="shot" href={href} tabIndex={-1} aria-hidden="true">{img}</a> : <figure className="shot">{img}</figure>
}

// Products as alternating rows: text, then a large real screen
export function ProductRows({ slugs }) {
  return <ul className="rows">{slugs.map(s => { const p = products.find(x => x.slug === s); return <li key={s} className="row reveal">
    <div className="row-text">
      <h3>{p.name}</h3>
      <p>{p.line}</p>
      <div className="row-links"><a className="tl" href={`/work/${s}`}>See the project</a><a className="tl" href={p.url} target="_blank" rel="noreferrer">{p.host}</a></div>
    </div>
    <Shot slug={s} name={p.name} href={`/work/${s}`} />
  </li> })}</ul>
}

// Client work we can name: name, one line, link. No logo on file, so no image.
export const Client = ({ c }) => <div className="client reveal">
  <h3>{c.name}</h3>
  <p>{c.line} <a className="tl" href={c.url} target="_blank" rel="noreferrer">{c.host}</a></p>
</div>

export const List = ({ items }) => <ul className="list">{items.map(([h, p, href]) => <li key={h} className="reveal">
  {href ? <a href={href}><h3>{h}</h3><p>{p}</p></a> : <><h3>{h}</h3><p>{p}</p></>}
</li>)}</ul>

export const Flow = ({ steps, label }) => <ol className="flow reveal" style={{ '--n': steps.length }} aria-label={label}>
  {steps.map(([h, p]) => <li key={h}><h3>{h}</h3>{p && <p>{p}</p>}</li>)}
</ol>

export const Prices = ({ keys, scopes = {} }) => <div className="prices reveal" style={{ '--n': keys.length }}>
  {keys.map(k => { const p = pricing[k]; return <div key={k}>
    <h3>{p.name}</h3>
    <span className="amt num">{p.price}</span>
    <span className="unit">{p.unit}</span>
    <p>{scopes[k] || p.short}</p>
  </div> })}
</div>

// Every FAQ is a dropdown (founder, 2026-11-21: "it should always be like that"). Native <details>, so it works without
// JavaScript, with the keyboard and with a screen reader. The answers stay in the HTML for search engines.
export const Faq = ({ items }) => <div className="faq">{items.map(([q, a]) => <details key={q} className="faq-item reveal"><summary><span>{q}</span><i aria-hidden="true" /></summary><p>{a}</p></details>)}</div>

export const Links = ({ items }) => <ul className="links reveal">{items.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
