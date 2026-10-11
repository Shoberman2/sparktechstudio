import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowOut } from './Icons'
import './VentureSite.css'

const loop = [
  ['Observe', 'Watch what actually happened: usage, errors, tickets, spend, results.'],
  ['Select', 'Pick one improvement with a clear reason and a way to measure it.'],
  ['Approve', 'A person signs off on the scope, the budget, and the permissions.'],
  ['Implement', 'An agent makes the change in an isolated copy of the work.'],
  ['Verify', 'Retest for real. Check the release. Keep the evidence.'],
  ['Learn', 'Record the result, then improve the workflow that did the work.'],
]

const layers = [
  ['Company boundary', 'Each company connects its own product, data, brand, goals, budget, and permissions. Nothing crosses that line.', 'Sources in'],
  ['Knowledge ledger', 'Approved sources in. Exact evidence out. Every claim points back to its sentence.', 'Evidence'],
  ['Review', 'A person approves one company, one change, one budget. Approval expires.', 'Approval'],
  ['Runner', 'Reproduce it, fix it in isolation, verify it in a real browser, keep the proof.', 'Verified change out'],
]

const G = 'currentColor'
const emblems = {
  scribe: <><path d="M14 16h20M14 24h14M14 32h8" stroke={G} strokeWidth="2.4" strokeLinecap="round" /><path d="M34 26l4 4-4 4-4-4z" fill={G} /></>,
  scout: <><circle cx="24" cy="24" r="12" stroke={G} strokeWidth="1.8" /><circle cx="24" cy="24" r="4" fill={G} /><path d="M24 6v6M24 36v6M6 24h6M36 24h6" stroke={G} strokeWidth="2" strokeLinecap="round" /></>,
  mechanic: <><path d="M24 8l14 8v16l-14 8-14-8V16z" stroke={G} strokeWidth="1.8" strokeLinejoin="round" /><path d="M24 17l6 3.5v7L24 31l-6-3.5v-7z" fill={G} /></>,
  warden: <><path d="M24 7l14 5v11c0 8-6 13-14 16-8-3-14-8-14-16V12z" stroke={G} strokeWidth="1.8" strokeLinejoin="round" /><path d="M22 17h4v14h-4z" fill={G} /></>,
  analyst: <><circle cx="24" cy="24" r="16" stroke={G} strokeWidth="1.6" /><path d="M15 30v-4M21 30v-9M27 30v-13M33 30v-6" stroke={G} strokeWidth="3" strokeLinecap="round" /></>,
  herald: <><circle cx="16" cy="24" r="3.5" fill={G} /><path d="M22 16a10 10 0 0 1 0 16M27 11a17 17 0 0 1 0 26M32 7a23 23 0 0 1 0 34" stroke={G} strokeWidth="1.8" strokeLinecap="round" /></>,
  concierge: <><path d="M10 10h28v20H20l-7 6v-6h-3z" stroke={G} strokeWidth="1.8" strokeLinejoin="round" /><circle cx="18" cy="20" r="2" fill={G} /><circle cx="24" cy="20" r="2" fill={G} /><circle cx="30" cy="20" r="2" fill={G} /></>,
  auditor: <><circle cx="19" cy="24" r="11" stroke={G} strokeWidth="1.8" /><circle cx="29" cy="24" r="11" stroke={G} strokeWidth="1.8" /><path d="M24 15.5a11 11 0 0 1 0 17 11 11 0 0 1 0-17z" fill={G} /></>,
}

const workflows = [
  ['Scribe', 'Knowledge', 'scribe', 'Turns approved podcasts, transcripts, and notes into proposals worth testing.'],
  ['Scout', 'QA', 'scout', 'Uses the product like a customer. Finds the bug and reproduces it.'],
  ['Mechanic', 'Fixes & releases', 'mechanic', 'Fixes it in an isolated copy, retests it in a real browser, checks the release.'],
  ['Warden', 'Maintenance', 'warden', 'Daily checks. Recurring problems handled before they pile up.'],
  ['Analyst', 'Product improvement', 'analyst', 'Tests changes against outcomes that matter, not clicks.'],
  ['Herald', 'Content', 'herald', 'Drafts and reviews posts for X, TikTok, and other channels, inside each company’s permissions.'],
  ['Concierge', 'Support & operations', 'concierge', 'Handles the repeatable requests. Routes the exceptions to a person.'],
  ['Auditor', 'Self-improvement', 'auditor', 'Proposes changes to the workflows themselves. Only proven changes stick.'],
]

const companies = [
  { name: 'UTern', url: 'https://utern.ai', host: 'utern.ai', logo: '/logo-utern.png', desc: 'Two AI agents run the internship hunt.', status: 'Independent company. Not owned by SparkTech. First intended pilot.' },
  { name: 'LEED', url: 'https://www.leed.media', host: 'leed.media', logo: '/logo-leed.svg', desc: 'Stocks for stories. Sources visible only to verified journalists.', status: 'Intended system adoption.' },
  { name: 'Ballot Watch', url: 'https://ballotwatch.io', host: 'ballotwatch.io', logo: '/logo-ballotwatch.svg', desc: 'Local government, made legible.', status: 'Intended system adoption.' },
]

const EMAIL = 'contactus@sparktechstudio.com'

const pages = [
  ['/idea', 'The idea'],
  ['/how-its-built', 'How it’s built'],
  ['/workflows', 'Workflows'],
  ['/companies', 'Companies'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
]

// Home-page section ids and the page each one stands for, used by the nav scroll-spy
const spy = { idea: '/idea', infrastructure: '/how-its-built', workflows: '/workflows', companies: '/companies', about: '/about' }

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Routing: plain pathname, no library. Page changes crossfade through the View Transitions API where it exists. ---------- */

const listeners = new Set()
function navigate(path) {
  if (path === window.location.pathname) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
  const go = () => {
    window.history.pushState(null, '', path)
    window.scrollTo({ top: 0, behavior: 'instant' })
    flushSync(() => listeners.forEach(fn => fn()))
  }
  if (document.startViewTransition && !reduced()) document.startViewTransition(go)
  else go()
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    listeners.add(update)
    window.addEventListener('popstate', update)
    return () => { listeners.delete(update); window.removeEventListener('popstate', update) }
  }, [])
  return path
}

function Link({ to, children, ...rest }) {
  const click = event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={click} {...rest}>{children}</a>
}

/* ---------- Pieces ---------- */

// A run of text that rises through a clipping mask once an ancestor gets .is-in. Block by default; inline for single words.
const Rise = ({ children, n = 0, inline, className }) => <span className={`rs-mask${inline ? ' rs-mask-inline' : ''}`}><span className={`rs-rise${className ? ` ${className}` : ''}`} style={{ '--n': n }}>{children}</span></span>

// A line of words, each rising on its own beat. `accent` names one word to set in gold.
const Words = ({ text, n0 = 0, accent }) => text.split(' ').map((word, i) => <Rise key={word + i} inline n={n0 + i} className={word === accent ? 'rs-accent' : undefined}>{word}{i < text.split(' ').length - 1 ? ' ' : ''}</Rise>)

// The loop as a full-width track. A gold line grows from stop to stop in real time; when it lands, the readout moves on.
function Track() {
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle] = useState(0)
  const tabs = useRef([])
  const count = loop.length
  const cells = count + 1 // six stages plus the return mark at the end of the line

  useEffect(() => {
    if (paused || reduced()) return
    const id = setInterval(() => setStep(s => (s + 1) % count), 3600)
    return () => clearInterval(id)
  }, [paused, count])

  const hold = () => setPaused(true)
  // Resuming remounts the line so it starts again from the current stop, in step with the new interval
  const release = () => { setPaused(false); setCycle(c => c + 1) }
  const choose = index => { setStep(index); setPaused(true) }

  const key = (event, index) => {
    let next
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + count - 1) % count
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = count - 1
    if (next === undefined) return
    event.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  const x = i => `${(i / cells) * 100}%`

  return <div className="rs-track-band" onMouseEnter={hold} onMouseLeave={release} onFocus={hold}>
    <div className="rs-wrap rs-track-inner">
      <div className="rs-track-read" id="loop-panel" role="tabpanel" aria-labelledby={`loop-${step}`} tabIndex={0}>
        <div className="rs-track-text" key={step}>
          <strong>{loop[step][0]}</strong>
          <p>{loop[step][1]}</p>
        </div>
      </div>
      <div className="rs-track" role="tablist" aria-label="The improvement loop" style={{ '--n': cells }}>
        <span className="rs-track-line" aria-hidden="true" />
        <span className="rs-track-fill" key={`${step}-${cycle}`} style={{ '--from': x(step), '--to': x(step + 1) }} data-paused={paused || undefined} aria-hidden="true" />
        {loop.map(([name], index) => <button
          key={name}
          type="button"
          role="tab"
          className="rs-stop"
          id={`loop-${index}`}
          aria-controls="loop-panel"
          aria-selected={step === index}
          data-done={index < step || undefined}
          tabIndex={step === index ? 0 : -1}
          ref={node => { tabs.current[index] = node }}
          onKeyDown={event => key(event, index)}
          onClick={() => choose(index)}
        ><span>{name}</span><i /></button>)}
        <span className="rs-stop rs-stop-return" aria-hidden="true"><span>↺</span><i /></span>
      </div>
    </div>
  </div>
}

function useReveal(path) {
  useEffect(() => {
    const items = [...document.querySelectorAll('[data-reveal]')]
    if (reduced() || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    items.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [path])
}

// One scroll listener for the nav: hairline after a little scroll, the read-progress line, and which home section is in view
function useScrollState(path) {
  const [scrolled, setScrolled] = useState(false)
  const [section, setSection] = useState(null)
  useEffect(() => {
    let raf = 0
    const targets = path === '/' ? Object.keys(spy).map(id => document.getElementById(id)).filter(Boolean) : []
    const tick = () => {
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setScrolled(root.scrollTop > 24)
      root.style.setProperty('--p', max > 0 ? (root.scrollTop / max).toFixed(4) : '0')
      const line = root.scrollTop + root.clientHeight * 0.4
      let current = null
      for (const el of targets) if (el.getBoundingClientRect().top + root.scrollTop <= line) current = spy[el.id]
      setSection(current)
    }
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick) }
    on()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [path])
  return [scrolled, section]
}

function Nav({ path }) {
  const [scrolled, section] = useScrollState(path)
  return <header className={`rs-nav${scrolled ? ' is-scrolled' : ''}`}>
    <div className="rs-wrap rs-nav-inner">
      <Link className="rs-brand" to="/"><img src="/logo.svg" width="22" height="22" alt="" />SparkTech Studio</Link>
      <nav aria-label="Main navigation">{pages.slice(0, 5).map(([to, label]) => <Link key={to} to={to} aria-current={path === to ? 'page' : undefined} data-active={section === to || undefined}>{label}</Link>)}</nav>
      <Link className="rs-nav-cta" to="/contact">Get in touch <ArrowOut /></Link>
    </div>
  </header>
}

function Hero() {
  return <section className="rs-hero">
    <div className="rs-hero-drift">
      <div className="rs-wrap rs-hero-inner" data-reveal>
        <h1 className="rs-hero-title">
          <span className="rs-line"><Words text="Companies that" /></span>
          <span className="rs-line"><Words text="get better" n0={2} accent="better" /></span>
          <span className="rs-line"><Words text="every day." n0={4} /></span>
        </h1>
        <div className="rs-hero-row">
          <p className="rs-hero-text">We build the product, then run the AI systems that keep improving it.</p>
          <div className="rs-hero-actions">
            <Link className="rs-button" to="/contact">Build with us <ArrowOut /></Link>
            <Link className="rs-textlink" to="/idea">See how it works</Link>
          </div>
        </div>
      </div>
    </div>
    <Track />
  </section>
}

/* A section opened as its own page owns the page's one h1; on the home page it stays an h2 under the hero. */
function Heading({ page, ...props }) {
  const Tag = page ? 'h1' : 'h2'
  return <Tag {...props} />
}

function Idea({ page }) {
  return <section className={`rs-section rs-idea${page ? ' rs-page' : ''}`} id="idea" aria-labelledby="idea-title">
    <div className="rs-wrap rs-idea-grid">
      <Heading page={page} id="idea-title" data-reveal><Rise>Recursive</Rise><Rise n={1}>Self-Enterprise</Rise><Rise n={2} className="rs-accent">Improvement.</Rise></Heading>
      <div className="rs-idea-copy" data-reveal style={{ '--d': '180ms' }}>
        <p className="rs-lead">One loop, run on every part of a company.</p>
        <p className="rs-lead rs-lead-strong">Then run it on the workflow that did the work.</p>
      </div>
    </div>
    {page && <div className="rs-idea-track"><Track /></div>}
  </section>
}

function Built({ page }) {
  return <section className={`rs-section rs-built${page ? ' rs-page' : ''}`} id="infrastructure" aria-labelledby="infra-title">
    <div className="rs-wrap">
      <div className="rs-head-row" data-reveal>
        <Heading page={page} id="infra-title"><Rise>One system.</Rise><Rise n={1}>Four layers.</Rise></Heading>
        <p className="rs-lead">Sources in one end. A verified change out the other. A person signs off in the middle.</p>
      </div>
      <ol className="rs-stack">
        {layers.map(([name, copy, tag], index) => <li key={name} className="rs-card" style={{ '--i': index }}>
          <div className="rs-card-head">
            <span className="rs-tag">{tag}</span>
            <h3>{name}</h3>
          </div>
          <p>{copy}</p>
        </li>)}
      </ol>
    </div>
  </section>
}

function Workflows({ page }) {
  return <section className={`rs-section rs-systems${page ? ' rs-page' : ''}`} id="workflows" aria-labelledby="workflows-title">
    <div className="rs-wrap">
      <div className="rs-head-row" data-reveal>
        <Heading page={page} id="workflows-title"><Rise>Eight named</Rise><Rise n={1}>workflows.</Rise></Heading>
        <p className="rs-lead">Each owns a job after launch, inside the company’s own permissions.</p>
      </div>
      <ol className="rs-wf-list">
        {workflows.map(([name, area, emblem, copy], index) => <li key={name} className="rs-wf" data-reveal style={{ '--d': `${index * 70}ms` }}>
          <span className="rs-wf-emblem" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">{emblems[emblem]}</svg></span>
          <span className="rs-wf-id"><h3>{name}</h3><span>{area}</span></span>
          <p>{copy}</p>
        </li>)}
      </ol>
      <p className="rs-status-line" data-reveal><span aria-hidden="true" />Today the test, fix, verify loop runs locally with a person approving each step. The first real pilot is next. Nothing is live yet.</p>
    </div>
  </section>
}

function Companies({ page }) {
  return <section className={`rs-section rs-companies${page ? ' rs-page' : ''}`} id="companies" aria-labelledby="companies-title">
    <div className="rs-wrap">
      <div className="rs-head-row" data-reveal>
        <Heading page={page} id="companies-title"><Rise>Same systems.</Rise><Rise n={1}>Your company.</Rise></Heading>
        <p className="rs-lead">Built around these first. Each keeps its own data, credentials, and permissions.</p>
      </div>
      <div className="rs-co-list">
        {companies.map((c, index) => <a key={c.name} className="rs-co" href={c.url} target="_blank" rel="noreferrer" data-reveal style={{ '--d': `${index * 110}ms` }}>
          <img src={c.logo} width="44" height="44" alt="" />
          <span className="rs-co-name"><strong>{c.name}</strong><span className="rs-mono">{c.host}</span></span>
          <span className="rs-co-body"><p>{c.desc}</p><small>{c.status}</small></span>
          <span className="rs-co-go" aria-hidden="true"><ArrowOut /></span>
        </a>)}
      </div>
      <p className="rs-note" data-reveal>Planned adoption, including UTern. Nothing is presented as live.</p>
    </div>
  </section>
}

function About({ page }) {
  return <section className={`rs-section rs-about${page ? ' rs-page' : ''}`} id="about" aria-labelledby="about-title">
    <div className="rs-wrap rs-about-grid">
      <div className="rs-about-side" data-reveal>
        <Heading page={page} id="about-title"><Rise>Built by</Rise><Rise n={1} className="rs-accent">Spencer Hoberman.</Rise></Heading>
        <p className="rs-about-meta">Founder, SparkTech Studio<br />New York</p>
      </div>
      <div className="rs-about-copy" data-reveal style={{ '--d': '140ms' }}>
        <p className="rs-about-lead">I started SparkTech Studio to build products. Now I’m building the systems that keep them improving after launch.</p>
        <p>First, one pilot. An agent tests UTern like a customer, finds a real bug, fixes it in an isolated copy, and proves the fix in a real browser, with me approving each step. UTern, which I also build, runs independently of the studio.</p>
        <Link className="rs-button rs-button-ghost" to="/contact">Work with me <ArrowOut /></Link>
      </div>
    </div>
  </section>
}

function ContactForm() {
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending'); setError('')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const body = await r.json().catch(() => ({}))
      if (r.ok && body.ok) { setState('sent'); form.reset(); return }
      setState('error'); setError(body.error || 'Could not send right now.')
    } catch {
      setState('error'); setError('Could not send right now.')
    }
  }
  if (state === 'sent') return <p className="rs-form-done" role="status">Got it. We read every message and answer from the studio inbox.</p>
  return <form className="rs-form" onSubmit={submit} noValidate>
    <label className="rs-field"><span>Name</span><input name="name" type="text" autoComplete="name" maxLength={120} /></label>
    <label className="rs-field"><span>Email</span><input name="email" type="email" autoComplete="email" required maxLength={200} /></label>
    <label className="rs-field rs-field-wide"><span>What you’re building, or what keeps breaking</span><textarea name="message" rows={5} required minLength={10} maxLength={4000} /></label>
    <label className="rs-field rs-hp" aria-hidden="true"><span>Company website</span><input name="company_website" type="text" tabIndex={-1} autoComplete="off" /></label>
    <div className="rs-form-actions">
      <button className="rs-button" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send to the studio'} <ArrowOut /></button>
      {state === 'error' && <p className="rs-form-error" role="alert">{error} You can also write to <a className="rs-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
    </div>
  </form>
}

function Contact({ page }) {
  return <section className={`rs-section rs-cta${page ? ' rs-page' : ''}`} id="contact" aria-labelledby="cta-title">
    <div className="rs-wrap" data-reveal>
      <Heading page={page} id="cta-title"><Rise>Let’s <span className="rs-accent">build it.</span></Rise></Heading>
      <div className="rs-cta-row">
        <div>
          <p className="rs-cta-copy">One message goes straight to the studio. Tell us what you’re building, or what keeps breaking.</p>
          <a className="rs-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
        <ContactForm />
      </div>
    </div>
  </section>
}

function Footer() {
  return <footer className="rs-footer">
    <div className="rs-wrap">
      <div className="rs-footer-grid">
        <div className="rs-footer-brand">
          <Link className="rs-brand" to="/"><img src="/logo.svg" width="22" height="22" alt="" />SparkTech Studio</Link>
          <p>We build the product, then run the AI systems that keep improving it.</p>
          <a className="rs-footer-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
        <nav aria-label="Site"><h4>Site</h4>{pages.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</nav>
        <nav aria-label="Companies"><h4>Companies</h4>{companies.map(c => <a key={c.name} href={c.url} target="_blank" rel="noreferrer">{c.name} <ArrowOut /></a>)}</nav>
      </div>
      <div className="rs-footer-bottom">
        <span><strong>Recursive Self-Enterprise Improvement.</strong> Improve the product. Learn from the result. Improve the workflow.</span>
        <span>© {new Date().getFullYear()} SparkTech Studios, LLC</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </div>
  </footer>
}

const titles = {
  '/': 'SparkTech Studio | Recursive Self-Enterprise Improvement',
  '/idea': 'The idea | SparkTech Studio',
  '/how-its-built': 'How it’s built | SparkTech Studio',
  '/workflows': 'Workflows | SparkTech Studio',
  '/companies': 'Companies | SparkTech Studio',
  '/about': 'About | SparkTech Studio',
  '/contact': 'Contact | SparkTech Studio',
}

export default function VentureSite() {
  const path = usePath()
  useReveal(path)
  useEffect(() => { document.title = titles[path] || titles['/'] }, [path])

  let body
  switch (path) {
    case '/idea': body = <><Idea page /><Built /><Contact /></>; break
    case '/how-its-built': body = <><Built page /><Workflows /><Contact /></>; break
    case '/workflows': body = <><Workflows page /><Companies /><Contact /></>; break
    case '/companies': body = <><Companies page /><About /><Contact /></>; break
    case '/about': body = <><About page /><Contact /></>; break
    case '/contact': body = <><Contact page /></>; break
    default: body = <><Hero /><Idea /><Built /><Workflows /><Companies /><About /><Contact /></>
  }

  return <div className="rs-site" id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="rs-frame" aria-hidden="true" />
    <Nav path={path} />
    <main id="main" key={path}>{body}</main>
    <Footer />
  </div>
}
