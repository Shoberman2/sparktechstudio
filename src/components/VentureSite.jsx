import { useEffect, useRef, useState } from 'react'
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
  ['Company boundary', 'Each company connects its own product, accounts, data, brand, goals, budget, and permissions. Nothing crosses that line.', 'Sources in'],
  ['Knowledge ledger', 'Approved sources go in. Exact evidence comes out. Every claim points back to the sentence it came from.', 'Evidence'],
  ['Review', 'Proposals wait for a person. Approval covers one company, one change, one budget, and it expires.', 'Approval'],
  ['Runner', 'Reproduce the problem, make the change in isolation, verify it in a real browser, and keep the proof.', 'Verified change out'],
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
  ['Scribe', 'Knowledge', 'scribe', 'Reads approved podcasts, transcripts, and notes for a company and turns them into proposals worth testing.'],
  ['Scout', 'QA', 'scout', 'Uses the product like a customer. Finds the bug, reproduces it, and hands over the evidence.'],
  ['Mechanic', 'Fixes & releases', 'mechanic', 'Makes the fix in an isolated copy, retests it in a real browser, and checks the release.'],
  ['Warden', 'Maintenance', 'warden', 'Runs the daily checks and handles recurring problems before they pile up.'],
  ['Analyst', 'Product improvement', 'analyst', 'Finds user friction and tests changes against outcomes that matter, not clicks.'],
  ['Herald', 'Content', 'herald', 'Researches, drafts, and reviews posts for X, TikTok, and other channels, inside each company’s publishing permissions.'],
  ['Concierge', 'Support & operations', 'concierge', 'Handles the repeatable requests and routes the exceptions to a person.'],
  ['Auditor', 'Self-improvement', 'auditor', 'Reviews what the other workflows produced and proposes changes to the workflows themselves. Only proven changes stick.'],
]

const companies = [
  { name: 'UTern', url: 'https://utern.ai', host: 'utern.ai', logo: '/logo-utern.png', desc: 'Two AI agents run the internship hunt. One argues for the student, one screens for the recruiter.', status: 'Independent company. Not owned by SparkTech. First intended pilot.' },
  { name: 'LEED', url: 'https://www.leed.media', host: 'leed.media', logo: '/logo-leed.svg', desc: 'Stocks for stories. Leads land on a public signal board, AI clusters them, and only verified journalists see the source.', status: 'Intended system adoption.' },
  { name: 'Ballot Watch', url: 'https://ballotwatch.io', host: 'ballotwatch.io', logo: '/logo-ballotwatch.svg', desc: 'Local government, made legible. Bills, reps, and voting records in one place.', status: 'Intended system adoption.' },
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

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Routing: plain pathname, no library ---------- */

const listeners = new Set()
function navigate(path) {
  if (path === window.location.pathname) { window.scrollTo({ top: 0 }); return }
  window.history.pushState(null, '', path)
  window.scrollTo({ top: 0 })
  listeners.forEach(fn => fn())
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

const Mark = props => <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
  <path d="M24 4 L26.5 18 L28 14 L24 4z" /><path d="M24 44 L21.5 30 L20 34 L24 44z" /><path d="M4 24 L18 21.5 L14 20 L4 24z" /><path d="M44 24 L30 26.5 L34 28 L44 24z" /><path d="M24 18 L30 24 L24 30 L18 24z" />
  <circle cx="14" cy="14" r="1.5" opacity=".6" /><circle cx="34" cy="14" r="1" opacity=".4" /><circle cx="34" cy="34" r="1.5" opacity=".5" /><circle cx="14" cy="34" r="1" opacity=".3" />
</svg>

function Loop() {
  const [total, setTotal] = useState(0)
  const [paused, setPaused] = useState(false)
  const tabs = useRef([])
  const count = loop.length
  const step = ((total % count) + count) % count

  useEffect(() => {
    if (paused || reduced()) return
    const id = setInterval(() => setTotal(n => n + 1), 3400)
    return () => clearInterval(id)
  }, [paused])

  const choose = index => {
    setTotal(n => {
      const current = ((n % count) + count) % count
      const forward = (index - current + count) % count
      return n + (forward === 0 ? count : forward)
    })
    setPaused(true)
  }

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

  return <div className="rs-loop" style={{ '--step': step, '--total': total, '--count': count }} onMouseEnter={() => setPaused(true)} onFocus={() => setPaused(true)}>
    <div className="rs-ring">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="rs-orbit" cx="50" cy="50" r="44" />
        <circle className="rs-sweep" cx="50" cy="50" r="44" pathLength="100" />
        <g className="rs-spark"><g transform="translate(-21 -21) scale(0.875)"><Mark width="48" height="48" /></g></g>
      </svg>
      <div className="rs-nodes" role="tablist" aria-label="Explore the improvement loop">
        {loop.map(([name], index) => <button
          key={name}
          type="button"
          role="tab"
          id={`loop-${index}`}
          aria-controls="loop-panel"
          aria-selected={step === index}
          tabIndex={step === index ? 0 : -1}
          style={{ '--i': index }}
          ref={node => { tabs.current[index] = node }}
          onKeyDown={event => key(event, index)}
          onClick={() => choose(index)}
        ><span><i />{name}</span></button>)}
      </div>
      <button className="rs-next" type="button" aria-label={`Next stage: ${loop[(step + 1) % count][0]}`} onClick={() => choose((step + 1) % count)} />
    </div>
    <div className="rs-panel" id="loop-panel" role="tabpanel" aria-labelledby={`loop-${step}`} tabIndex={0}>
      <div className="rs-panel-inner" key={step}>
        <strong>{loop[step][0]}</strong>
        <p>{loop[step][1]}</p>
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

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const check = () => setScrolled(scrollY > 24)
    check()
    addEventListener('scroll', check, { passive: true })
    return () => removeEventListener('scroll', check)
  }, [])
  return scrolled
}

function Nav({ path }) {
  const scrolled = useScrolled()
  return <header className={`rs-nav${scrolled ? ' is-scrolled' : ''}`}>
    <div className="rs-wrap rs-nav-inner">
      <Link className="rs-brand" to="/"><img src="/logo.svg" width="24" height="24" alt="" />SparkTech Studio</Link>
      <nav aria-label="Main navigation">{pages.slice(0, 5).map(([to, label]) => <Link key={to} to={to} aria-current={path === to ? 'page' : undefined}>{label}</Link>)}</nav>
      <Link className="rs-nav-cta" to="/contact">Get in touch <ArrowOut /></Link>
    </div>
  </header>
}

function Hero() {
  return <section className="rs-hero">
    <div className="rs-wrap rs-hero-grid">
      <div className="rs-hero-copy">
        <h1 className="rs-hero-title">Companies that<br /><span>get better every day.</span></h1>
        <p className="rs-hero-text">We build the product, then run the AI systems that keep making it better. Every company plugs in with its own data, goals, and permissions.</p>
        <div className="rs-hero-actions">
          <Link className="rs-button" to="/contact">Build with us <ArrowOut /></Link>
          <Link className="rs-button rs-button-ghost" to="/idea">See how it works</Link>
        </div>
      </div>
      <Loop />
    </div>
  </section>
}

function Idea({ page }) {
  return <section className={`rs-section rs-idea${page ? ' rs-page' : ''}`} id="idea" aria-labelledby="idea-title">
    <div className="rs-wrap">
      <div className="rs-head" data-reveal>
        <h2 id="idea-title">Recursive Self-Enterprise Improvement.</h2>
        <p className="rs-lead">One loop, run on every part of a company. Observe what happened. Select one improvement. Get it approved. Implement it. Verify it. Learn from the result. Then run the same loop on the workflow that did the work.</p>
      </div>
      {page && <div className="rs-idea-loop"><Loop /></div>}
    </div>
  </section>
}

function Built({ page }) {
  return <section className={`rs-section rs-infra${page ? ' rs-page' : ''}`} id="infrastructure" aria-labelledby="infra-title">
    <div className="rs-wrap">
      <div className="rs-head" data-reveal>
        <h2 id="infra-title">One system. Four layers.</h2>
        <p className="rs-lead">Approved sources go in one end. A verified change comes out the other. A person signs off in the middle.</p>
      </div>
      <ol className="rs-layers" data-reveal>
        {layers.map(([name, copy, tag], index) => <li key={name} style={{ '--d': `${index * 120}ms` }}>
          <span className="rs-layer-tag">{tag}</span>
          <h3>{name}</h3>
          <p>{copy}</p>
        </li>)}
      </ol>
    </div>
  </section>
}

function Workflows({ page }) {
  return <section className={`rs-section rs-systems${page ? ' rs-page' : ''}`} id="workflows" aria-labelledby="workflows-title">
    <div className="rs-wrap">
      <div className="rs-head" data-reveal>
        <h2 id="workflows-title">Eight named workflows.</h2>
        <p className="rs-lead">Each one owns a job after launch and runs inside a company’s own permissions.</p>
      </div>
      <div className="rs-system-grid">
        {workflows.map(([name, area, emblem, copy], index) => <article key={name} data-reveal style={{ '--d': `${(index % 4) * 80}ms` }}>
          <span className="rs-wf-emblem" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">{emblems[emblem]}</svg></span>
          <span className="rs-system-area">{area}</span>
          <h3>{name}</h3>
          <p>{copy}</p>
        </article>)}
      </div>
      <p className="rs-status-line" data-reveal><span aria-hidden="true" />Today the test, fix, verify loop runs locally with a person approving each step. The first real pilot is next. Nothing is live yet.</p>
    </div>
  </section>
}

function Companies({ page }) {
  return <section className={`rs-section rs-companies${page ? ' rs-page' : ''}`} id="companies" aria-labelledby="companies-title">
    <div className="rs-wrap">
      <div className="rs-head" data-reveal>
        <h2 id="companies-title">Same systems. Your company.</h2>
        <p className="rs-lead">These are the companies the systems are being built around first. Each keeps its own data, credentials, brand, goals, budgets, and permissions.</p>
      </div>
      <div className="rs-company-grid">
        {companies.map((c, index) => <a key={c.name} className="rs-company" href={c.url} target="_blank" rel="noreferrer" data-reveal style={{ '--d': `${index * 100}ms` }}>
          <span className="rs-company-top"><img src={c.logo} width="40" height="40" alt="" /><span className="rs-company-host">{c.host} <ArrowOut /></span></span>
          <strong>{c.name}</strong>
          <p>{c.desc}</p>
          <small>{c.status}</small>
        </a>)}
      </div>
      <p className="rs-note" data-reveal>Planned adoption, including UTern. Integrations are not yet presented as live.</p>
    </div>
  </section>
}

function About({ page }) {
  return <section className={`rs-section rs-about rs-dark${page ? ' rs-page' : ''}`} id="about" aria-labelledby="about-title">
    <Mark className="rs-watermark" />
    <div className="rs-wrap rs-about-grid">
      <div className="rs-about-side" data-reveal>
        <h2 id="about-title">Built by<br /><span>Spencer Hoberman.</span></h2>
        <p className="rs-about-meta">Founder, SparkTech Studio<br />New York</p>
      </div>
      <div className="rs-about-copy" data-reveal style={{ '--d': '120ms' }}>
        <p className="rs-about-lead">I started SparkTech Studio to build products. Now I’m building the systems that keep them improving after launch.</p>
        <p>Right now that means one thing: getting the first pilot working. An agent tests UTern like a customer, finds a real bug, fixes it in an isolated copy, and proves the fix in a real browser, with me approving each step. Once that loop holds on one product, the next company connects without rebuilding anything.</p>
        <p>SparkTech owns the systems. Each company keeps its own data, credentials, and permissions. UTern, which I also build, runs independently of the studio.</p>
        <Link className="rs-button rs-button-outline" to="/contact">Work with me <ArrowOut /></Link>
      </div>
    </div>
  </section>
}

function Contact({ page }) {
  return <section className={`rs-cta rs-dark${page ? ' rs-page' : ''}`} id="contact" aria-labelledby="cta-title">
    <Mark className="rs-watermark rs-watermark-cta" />
    <div className="rs-wrap" data-reveal>
      <h2 id="cta-title">Let’s <span>build it.</span></h2>
      <p className="rs-cta-copy">One email goes straight to the studio. Tell us what you’re building, or what keeps breaking, and we’ll take it from there.</p>
      <div className="rs-cta-actions">
        <a className="rs-button rs-button-gold" href={`mailto:${EMAIL}`}>Email the studio <ArrowOut /></a>
        <a className="rs-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </div>
    </div>
  </section>
}

function Footer() {
  return <footer className="rs-footer">
    <div className="rs-wrap">
      <div className="rs-footer-grid">
        <div className="rs-footer-brand">
          <Link className="rs-brand" to="/"><img src="/logo.svg" width="24" height="24" alt="" />SparkTech Studio</Link>
          <p>We build the product, then run the AI systems that keep making it better.</p>
          <a className="rs-footer-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
        <nav aria-label="Site"><h4>Site</h4>{pages.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</nav>
        <nav aria-label="Companies"><h4>Companies</h4>{companies.map(c => <a key={c.name} href={c.url} target="_blank" rel="noreferrer">{c.name} <ArrowOut /></a>)}</nav>
        <nav aria-label="Studio"><h4>Studio</h4><a href={`mailto:${EMAIL}`}>Email us</a><a href="https://www.sparktechstudio.com/">sparktechstudio.com</a><a href="/mockups">Concept lab</a></nav>
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
    <Nav path={path} />
    <main id="main" key={path}>{body}</main>
    <Footer />
  </div>
}
