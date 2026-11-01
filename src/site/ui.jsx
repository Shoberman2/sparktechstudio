import { useEffect, useRef, useState } from 'react'
import { BOOK, EMAIL, companies } from '../designs/content.jsx'
import { pricing, serviceList, products } from './facts.js'
import Assistant from './Assistant.jsx'
import './site.css'

// Shared pieces for every page of Direction A (Spark Cloud). One button, one nav, one footer, one closing band.
const MARK = '/brand/sparktech-bolt-mark.png'
const LINKS = [['services', '/services', 'Services'], ['work', '/work', 'Work'], ['pricing', '/pricing', 'Pricing'], ['partners', '/partners', 'Partners']]

export const Book = ({ className = '' }) => <a className={`btn ${className}`.trim()} {...BOOK}>Book a call</a>

export const JsonLd = ({ data }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />

function Brand() {
  return <a href="/" className="brand"><img src={MARK} width="26" height="25" alt="" /><span>SparkTech Studio</span></a>
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
      <Book className="sm" />
      <button ref={btn} type="button" className="menu-btn" aria-expanded={open} aria-controls="menu-sheet" onClick={() => setOpen(true)}>Menu</button>
    </div>
    {open && <div className="sheet" id="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="sheet-top"><Brand /><button type="button" className="menu-btn" autoFocus onClick={() => { setOpen(false); btn.current?.focus() }}>Close</button></div>
      <nav aria-label="Main">
        <a href="/" onClick={() => setOpen(false)}>Home</a>
        {LINKS.map(([k, href, label]) => <a key={k} href={href} aria-current={active === k ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <Book />
    </div>}
  </header>
}

function Footer() {
  return <footer className="ft">
    <div className="wrap">
      <div className="ft-top">
        <div><Brand /><p>An independent New York studio building AI web apps, MVPs, websites and agent systems.</p></div>
        <Book />
      </div>
      <div className="ft-cols">
        <nav aria-label="Services"><h2>Services</h2><a href="/services">All services</a>{serviceList.map(s => <a key={s.slug} href={s.path}>{s.nav}</a>)}</nav>
        <nav aria-label="Work"><h2>Work</h2><a href="/work">All work</a>{products.map(p => <a key={p.slug} href={`/work/${p.slug}`}>{p.name}</a>)}</nav>
        <nav aria-label="Studio"><h2>Studio</h2><a href="/pricing">Pricing</a><a href="/partners">Partners</a><a href="/systems">System</a><a href="/#about">About</a><a href={`mailto:${EMAIL}`}>Email us</a></nav>
        <nav aria-label="Legal"><h2>Legal</h2><a href="/privacy">Privacy</a></nav>
      </div>
      <p className="ft-legal">© 2026 SparkTech Studios, Inc. · Not affiliated with sparktechstudios.com (Ontario)</p>
    </div>
  </footer>
}

// The signature background: the gold spark cloud, still, under a white scrim
export const CloudBg = () => <picture aria-hidden="true">
  <source media="(max-width: 700px)" srcSet="/brand/spark-cloud-mobile.webp" />
  <img src="/brand/spark-cloud.webp" alt="" width="2400" height="1400" fetchPriority="high" />
</picture>

export function Band({ title = 'Have Something To Build?', line = 'Book a call or email us. We reply within two business days.' }) {
  return <section className="band cloud" aria-label="Book a call">
    <CloudBg />
    <h2 className="reveal">{title}</h2>
    <p className="reveal">{line}</p>
    <div className="actions reveal"><Book /><a className="btn ghost" href={`mailto:${EMAIL}`}>Email us</a></div>
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
  return <div className={`st ${className}`.trim()}>
    <a className="skip" href="#main">Skip to content</a>
    <Nav active={active} />
    <main id="main">{children}</main>
    {band && <Band title={bandTitle} line={bandLine} />}
    <Footer />
    <Assistant />
  </div>
}

export function PageHead({ h1, lede, cta = true, children }) {
  return <section className="phead">
    <div className="wrap">
      <h1>{h1}</h1>
      {lede && <p>{lede}</p>}
      {cta && <div className="actions"><Book /><a className="btn ghost" href="/work">See our work</a></div>}
      {children}
    </div>
  </section>
}

export function Sec({ title, line, children, id, wide }) {
  return <section className="sec" id={id}>
    <div className={wide ? 'wrap' : 'wrap'}>
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
  return <ul className="rows">{slugs.map(s => { const p = products.find(x => x.slug === s); const c = companies.find(x => x.slug === s); return <li key={s} className="row reveal">
    <div className="row-text">
      <h3>{p.name}</h3>
      <p>{c.lede}</p>
      <div className="row-links"><a className="tl" href={`/work/${s}`}>Read the case study</a><a className="tl" href={p.url} target="_blank" rel="noreferrer">{p.host}</a></div>
    </div>
    <Shot slug={s} name={p.name} href={`/work/${s}`} />
  </li> })}</ul>
}

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

export const Faq = ({ items }) => <dl className="faq">{items.map(([q, a]) => <div key={q} className="reveal"><dt>{q}</dt><dd>{a}</dd></div>)}</dl>

export const Links = ({ items }) => <ul className="links reveal">{items.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
