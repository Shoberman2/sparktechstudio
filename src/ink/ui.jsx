import { useEffect, useRef, useState } from 'react'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import './ink.css'
import { companies, pricing, EMAIL, BOOK } from '../designs/content.jsx'
import { services, industry } from '../designs/pages.jsx'
import { client, work, LEGAL, flow } from './copy.js'

const BOLT = '/brand/sparktech-bolt-mark-256.png'

// Structured data rendered into the page itself, so the prerendered HTML carries it
export const JsonLd = ({ data }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />

export const Btn = ({ ghost, small, className = '', ...props }) => <a className={`btn${ghost ? ' btn-ghost' : ''}${small ? ' btn-sm' : ''} ${className}`.trim()} {...props} />
export const Book = props => <Btn {...BOOK} {...props}>Book a call</Btn>

const NAV = [['Services', '/services'], ['Work', '/work'], ['Pricing', '/pricing'], ['Partners', '/partners']]
const current = (path, href) => path === href || path.startsWith(`${href}/`)

function Nav({ path }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuBtn = useRef(null)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const key = e => { if (e.key === 'Escape') { setOpen(false); menuBtn.current?.focus() } }
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    document.body.classList.add('menu-open')
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; document.body.classList.remove('menu-open') }
  }, [open])
  const links = NAV.map(([label, href]) => <a key={href} href={href} aria-current={current(path, href) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>)
  return <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
    <div className="nav-in">
      <a href="/" className="mark" aria-label="SparkTech Studio, home"><img src={BOLT} width="26" height="25" alt="" /><span>SparkTech Studio</span></a>
      <nav className="nav-links" aria-label="Main">{links}</nav>
      <Book small />
      <button ref={menuBtn} className="nav-menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>Menu</button>
    </div>
    <div id="menu" className={`sheet${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} inert={open ? undefined : true}>
      <div className="sheet-top">
        <a href="/" className="mark" onClick={() => setOpen(false)}><img src={BOLT} width="26" height="25" alt="" /><span>SparkTech Studio</span></a>
        <button className="nav-menu" style={{ display: 'inline-flex' }} onClick={() => { setOpen(false); menuBtn.current?.focus() }}>Close</button>
      </div>
      <nav aria-label="Menu links">{[<a key="home" href="/" onClick={() => setOpen(false)}>Home</a>, ...links]}</nav>
      <Book onClick={() => setOpen(false)} />
    </div>
  </header>
}

function Footer() {
  const svc = [...services.map(s => [s.nav, s.path]), ['Law, finance and medical', industry.path]]
  const wk = [['All work', '/work'], ...work.map(s => [companies.find(c => c.slug === s).name, `/work/${s}`])]
  return <footer className="foot">
    <div className="wrap">
      <div className="foot-top">
        <div>
          <a href="/" className="mark"><img src={BOLT} width="26" height="25" alt="" />SparkTech Studio</a>
          <p>A New York studio. Websites and AI agents for businesses.</p>
        </div>
        <Book />
      </div>
      <div className="foot-cols">
        <nav aria-labelledby="f-svc"><h2 id="f-svc">Services</h2>{svc.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</nav>
        <nav aria-labelledby="f-work"><h2 id="f-work">Work</h2>{wk.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</nav>
        <nav aria-labelledby="f-studio"><h2 id="f-studio">Studio</h2><a href="/pricing">Pricing</a><a href="/partners">Partners</a><a href={`mailto:${EMAIL}`}>Email us</a></nav>
        <nav aria-labelledby="f-legal"><h2 id="f-legal">Legal</h2><a href="/privacy">Privacy</a></nav>
      </div>
      <p className="foot-legal">{LEGAL}</p>
    </div>
  </footer>
}

// Fade-up on scroll. Elements already on screen are marked visible before <html> gets the class, so nothing flashes.
function useReveal(path) {
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal:not(.in)')]
    const h = window.innerHeight
    for (const el of els) { const r = el.getBoundingClientRect(); if (r.top < h * 0.95) el.classList.add('in') }
    document.documentElement.classList.add('js-reveal')
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return }
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    els.filter(el => !el.classList.contains('in')).forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [path])
}

export function Shell({ path, title, children }) {
  useEffect(() => { if (title) document.title = title }, [title])
  useReveal(path)
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <Nav path={path} />
    <main id="main">{children}</main>
    <Footer />
    <Assistant />
  </>
}

// A centered statement: one h2, one line, then whatever explains it
export function Statement({ id, title, line, children }) {
  return <section className="sec" id={id}>
    <div className="wrap">
      <div className="state reveal"><h2>{title}</h2>{line && <p>{line}</p>}</div>
      {children && <div className="body reveal">{children}</div>}
    </div>
  </section>
}

export function PageHead({ h1, lede, cta = true }) {
  return <section className="page-head">
    <div className="wrap">
      <h1>{h1}</h1>
      {lede && <p className="lede">{lede}</p>}
      {cta && <div className="actions"><Book /><Btn ghost href="/work">See the work</Btn></div>}
    </div>
  </section>
}

// The closing band every page ends with
export function Ask({ title = 'Have Something in Mind?', line = 'We reply within two business days.' }) {
  return <section className="sec">
    <div className="wrap state reveal">
      <h2>{title}</h2>
      <p>{line}</p>
      <div className="actions"><Book /><Btn ghost href={`mailto:${EMAIL}`}>Email us</Btn></div>
    </div>
  </section>
}

export const List2 = ({ items, three }) => <ul className={`list2${three ? " list3" : ""}`}>{items.map(([h, p, href]) => <li key={h}>{href ? <a href={href}><h3>{h}</h3><p>{p}</p></a> : <div><h3>{h}</h3><p>{p}</p></div>}</li>)}</ul>

export const Flow = ({ steps = flow }) => <ol className="flow" style={{ '--n': steps.length }} aria-label="How a project runs">{steps.map(([h, p]) => <li key={h}><h3>{h}</h3>{p && <p>{p}</p>}</li>)}</ol>

export function Prices({ keys = ['launch', 'updates', 'care', 'growth'], scopes = {}, withScope = true }) {
  return <ul className="prices">{keys.map(k => { const p = pricing[k]; return <li key={k}>
    <h3>{p.name}</h3>
    <span className="num">{p.price}<small>{p.unit}</small></span>
    {withScope && <p>{scopes[k] || p.scope}</p>}
  </li> })}</ul>
}

const marks = { utern: ['/work/utern/birdee.webp', 'Birdee, the UTern mascot', 'is-mascot'], leed: ['/brand/leed.svg', 'Leed mark'], ballotwatch: ['/brand/ballotwatch.svg', 'BallotWatch Capitol mark'], validate: ['/brand/validate.svg', 'Validate-s mark'] }

// Compact work rows: real mark, name, one line, domain. The row opens the case study; the domain opens the live site.
export function Work({ slugs = work, withClient = false }) {
  const rows = slugs.map(s => { const c = companies.find(x => x.slug === s); return { key: s, name: c.name, line: c.line, href: `/work/${s}`, host: c.host, url: c.url, mark: marks[s] } })
  if (withClient) rows.push({ key: 'oasis', name: client.name, line: client.line, host: client.host, url: client.url })
  return <ul className="work">{rows.map(r => <li key={r.key}>
    <span className="logo">{r.mark && <img src={r.mark[0]} alt={r.mark[1]} className={r.mark[2]} loading="lazy" />}</span>
    <div>
      <h3>{r.href ? <a href={r.href}>{r.name}</a> : <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>}</h3>
      <p>{r.line}</p>
    </div>
    {r.href && <a className="host" href={r.url} target="_blank" rel="noreferrer">{r.host}</a>}
    {!r.href && <span className="host" aria-hidden="true">{r.host}</span>}
  </li>)}</ul>
}

// Real work, shown as the product's own screen. The client has no screen here, so it gets a plain text row.
export function Screens({ slugs = work, withClient = false }) {
  return <div className="screens-wrap">
    <ul className="screens">{slugs.map(s => { const c = companies.find(x => x.slug === s); return <li key={s}>
      <a href={`/work/${s}`}>
        <img src={`/work/${s}/og.jpg`} width="1200" height="630" alt={`The ${c.name} site`} loading="lazy" />
        <h3>{c.name}</h3>
        <p>{c.line}</p>
      </a>
    </li> })}</ul>
    {withClient && <p className="client"><strong>Client: {client.name}.</strong> {client.line} <a href={client.url} target="_blank" rel="noreferrer">{client.host}</a></p>}
  </div>
}

// Type-led work list: one left-aligned row per product in a centered 760px column. Real transparent logo
// (with no logo, the name alone is the wordmark), name, one line, domain as a gold link. `shots` adds the
// product's real screen under its row (used on /work only).
const typeLogos = { utern: ['/logo-utern.png', 'UTern logo'], leed: ['/logo-leed.svg', 'Leed logo'], ballotwatch: ['/logo-ballotwatch.svg', 'BallotWatch logo'] }
export function TypeList({ slugs = work, withClient = false, shots = false }) {
  const rows = slugs.map(s => { const c = companies.find(x => x.slug === s); return { key: s, name: c.name, line: c.line, href: `/work/${s}`, host: c.host, url: c.url, logo: typeLogos[s], shot: shots && `/work/${s}/og.jpg` } })
  if (withClient) rows.push({ key: 'oasis', name: client.name, line: `Client work. ${client.line}`, host: client.host, url: client.url })
  return <ul className="tlist">{rows.map(r => <li key={r.key}>
    {r.logo && <span className="tl-logo"><img src={r.logo[0]} alt={r.logo[1]} height="40" loading="lazy" /></span>}
    <h3>{r.href ? <a href={r.href}>{r.name}</a> : r.name}</h3>
    <p>{r.line}</p>
    <a className="tl-host" href={r.url} target="_blank" rel="noreferrer">{r.host}</a>
    {r.shot && <a className="tl-shot" href={r.href} tabIndex={-1} aria-hidden="true"><img src={r.shot} width="1200" height="630" alt="" loading="lazy" /></a>}
  </li>)}</ul>
}

/* ---------- Assistant: the bolt in the corner, a real model behind it ---------- */
const HELLO = 'Ask about services, pricing, our work, or how a project starts.'
export function Assistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const input = useRef(null), log = useRef(null), btn = useRef(null)
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 60) }, [open])
  useEffect(() => {
    if (!open) return
    const key = e => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open])
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }) }, [msgs, busy, err])
  async function send(e) {
    e.preventDefault()
    const q = text.trim()
    if (!q || busy) return
    const next = [...msgs, { role: 'user', content: q }]
    setMsgs(next); setText(''); setBusy(true); setErr(false)
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(-12) }) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || !data.text) throw new Error('failed')
      setMsgs(m => [...m, { role: 'assistant', content: data.text }])
    } catch { setErr(true) } finally { setBusy(false) }
  }
  return <>
    <button ref={btn} className="ast-btn" aria-label={open ? 'Close the assistant' : 'Ask SparkTech a question'} aria-expanded={open} aria-controls="ast" onClick={() => setOpen(o => !o)}>
      <img src={BOLT} width="30" height="29" alt="" />
    </button>
    <div id="ast" className={`ast${open ? ' open' : ''}`} role="dialog" aria-label="Ask SparkTech" aria-hidden={!open} inert={open ? undefined : true}>
      <div className="ast-head"><strong>Ask SparkTech</strong><button className="ast-close" onClick={() => { setOpen(false); btn.current?.focus() }}>Close</button></div>
      <div className="ast-log" ref={log} aria-live="polite">
        <p className="ast-msg bot">{HELLO}</p>
        {msgs.map((m, i) => <p key={i} className={`ast-msg ${m.role === 'user' ? 'me' : 'bot'}`}>{m.content}</p>)}
        {busy && <div className="ast-skel" aria-label="Writing an answer"><span /><span /></div>}
        {err && <p className="ast-msg err">The assistant is not answering right now. Email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we reply within two business days.</p>}
      </div>
      <form className="ast-form" onSubmit={send}>
        <label htmlFor="ast-q" className="skip">Your question</label>
        <input id="ast-q" ref={input} value={text} onChange={e => setText(e.target.value)} placeholder="Your question" maxLength={600} autoComplete="off" />
        <button className="btn" type="submit" disabled={busy || !text.trim()}>Send</button>
      </form>
    </div>
  </>
}
