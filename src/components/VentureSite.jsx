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

// Status is what is true today. Pilot: runs on sparktechstudio.com. Prototype: works locally on test data. Planned: designed, not built.
const workflows = [
  ['Scout', 'QA', 'scout', 'Uses the site like a visitor on desktop and phone. Finds the bug and reproduces it.', 'Pilot'],
  ['Mechanic', 'Fixes & releases', 'mechanic', 'Fixes it in an isolated copy, retests it in a real browser, ships it, checks production.', 'Pilot'],
  ['Scribe', 'Knowledge', 'scribe', 'Turns approved podcasts, transcripts, and notes into proposals worth testing.', 'Prototype'],
  ['Warden', 'Maintenance', 'warden', 'Will run the checks every night so recurring problems get handled before they pile up.', 'Prototype'],
  ['Analyst', 'Product improvement', 'analyst', 'Will test changes against outcomes that matter, not clicks.', 'Planned'],
  ['Herald', 'Content', 'herald', 'Will draft posts for X, TikTok, and other channels for a person to review.', 'Planned'],
  ['Concierge', 'Support & operations', 'concierge', 'Will handle the repeatable requests and route the exceptions to a person.', 'Planned'],
  ['Auditor', 'Self-improvement', 'auditor', 'Will propose changes to the workflows themselves. Only proven changes stick.', 'Planned'],
]

const offer = [
  ['A call', 'Tell us the idea, or the product that keeps breaking. We’ll tell you straight whether we’re the right people to build it.'],
  ['A written scope', 'What we build, what launches first, the price, the timeline, who owns the code, and what support looks like. Nothing starts until you approve it.'],
  ['Build and launch', 'We build it and ship it to production on your domain, ready for real traffic.'],
  ['After launch', 'If you want it, the product joins the improvement loop. That part is in pilot, so we’ll show you exactly what runs and what doesn’t.'],
]

// The loop's first unattended production release, on this site. Evidence: run 20261011T163353-1a538094, commit 4c45203.
const COMMIT = 'https://github.com/Shoberman2/sparktechstudio/commit/4c45203de1329956bd8a4d457dff1e5096eda120'
const proof = [
  ['The problem', 'Six section pages had no main heading. Bad for screen readers and search.'],
  ['Found', 'Scout probed sparktechstudio.com on desktop and phone and reproduced it twice in a headless browser.'],
  ['Fixed', 'Mechanic repaired it in an isolated copy, then passed lint, the build, and a second browser check.'],
  ['Shipped', 'Pushed to main, deployed on Vercel, production checked afterward. Nobody steered the run.'],
  ['Time and cost', '208 seconds. $1.61 in model usage.'],
  ['When', 'October 11, 2026.'],
]

const companies = [
  { name: 'UTern', url: 'https://utern.ai', host: 'utern.ai', logo: '/logo-utern.png', desc: 'Active recruiting for internships. Birdee, UTern’s AI, finds internships that fit a student and helps them get picked.', status: 'Live: the student app with Birdee at utern.ai. The bigger vision, from enrollment to employment, is still ahead. Independent company, not owned by SparkTech.' },
  { name: 'LEED', url: 'https://www.leed.media', host: 'leed.media', logo: '/logo-leed.svg', desc: 'Stocks for stories. Sources visible only to verified journalists.', status: 'Live at leed.media. Intended to adopt the systems.' },
  { name: 'Ballot Watch', url: 'https://ballotwatch.io', host: 'ballotwatch.io', logo: '/logo-ballotwatch.svg', desc: 'Local government, made legible.', status: 'Live at ballotwatch.io. Intended to adopt the systems.' },
]

const EMAIL = 'contactus@sparktechstudio.com'

const pages = [
  ['/build', 'What we build'],
  ['/idea', 'The idea'],
  ['/how-its-built', 'How it’s built'],
  ['/workflows', 'Workflows'],
  ['/companies', 'Companies'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
]
const navPages = ['/build', '/idea', '/workflows', '/companies', '/about'].map(to => pages.find(p => p[0] === to))

// Home-page section ids and the page each one stands for, used by the nav scroll-spy
const spy = { offer: '/build', idea: '/idea', infrastructure: '/how-its-built', workflows: '/workflows', proof: '/companies', companies: '/companies', about: '/about' }

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
      <nav aria-label="Main navigation">{navPages.map(([to, label]) => <Link key={to} to={to} aria-current={path === to ? 'page' : undefined} data-active={section === to || undefined}>{label}</Link>)}</nav>
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
          <p className="rs-hero-text">Hire us to build your product. We ship it, then keep improving it with the AI systems we’re piloting now.</p>
          <div className="rs-hero-actions">
            <Link className="rs-button" to="/contact">Build with us <ArrowOut /></Link>
            <Link className="rs-textlink" to="/build">What you get</Link>
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

function Offer({ page }) {
  return <section className={`rs-section rs-offer${page ? ' rs-page' : ''}`} id="offer" aria-labelledby="offer-title">
    <div className="rs-wrap">
      <div className="rs-head-row" data-reveal>
        <Heading page={page} id="offer-title"><Rise>What you</Rise><Rise n={1} className="rs-accent">get.</Rise></Heading>
        <p className="rs-lead">For founders and companies with a product to build: a web app, a site, an AI tool, or the weird one other studios turn down.</p>
      </div>
      <ol className="rs-steps">
        {offer.map(([name, copy], index) => <li key={name} className="rs-step" data-reveal style={{ '--d': `${index * 80}ms` }}>
          <h3>{name}</h3>
          <p>{copy}</p>
        </li>)}
      </ol>
      <div className="rs-offer-foot" data-reveal>
        <Link className="rs-button" to="/contact">Start with a call <ArrowOut /></Link>
        <p className="rs-note">We reply within 2 business days.</p>
      </div>
    </div>
  </section>
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
        <p className="rs-lead">Each owns a job after launch, inside the company’s own permissions. Here is where each one actually stands.</p>
      </div>
      <ol className="rs-wf-list">
        {workflows.map(([name, area, emblem, copy, status], index) => <li key={name} className="rs-wf" data-reveal style={{ '--d': `${index * 70}ms` }}>
          <span className="rs-wf-emblem" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">{emblems[emblem]}</svg></span>
          <span className="rs-wf-id"><h3>{name}</h3><span>{area}</span></span>
          <p>{copy}</p>
          <span className="rs-wf-status" data-status={status.toLowerCase()}>{status}</span>
        </li>)}
      </ol>
      <p className="rs-status-line" data-reveal><span aria-hidden="true" /><span><strong>Pilot</strong> runs on sparktechstudio.com today. <strong>Prototype</strong> works locally on test data. <strong>Planned</strong> is designed, not built. No client company runs on these yet.</span></p>
    </div>
  </section>
}

function Proof() {
  return <section className="rs-section rs-proof" id="proof" aria-labelledby="proof-title">
    <div className="rs-wrap">
      <div className="rs-head-row" data-reveal>
        <h2 id="proof-title"><Rise>It fixed</Rise><Rise n={1} className="rs-accent">this site.</Rise></h2>
        <p className="rs-lead">Our first real result. Small, and on our own site, with the owner’s standing approval. Not a client result yet.</p>
      </div>
      <dl className="rs-proof-grid">
        {proof.map(([term, detail], index) => <div key={term} data-reveal style={{ '--d': `${index * 60}ms` }}><dt>{term}</dt><dd>{detail}</dd></div>)}
      </dl>
      <a className="rs-textlink rs-proof-link" href={COMMIT} target="_blank" rel="noreferrer">See the commit on GitHub</a>
    </div>
  </section>
}

function Companies({ page }) {
  return <section className={`rs-section rs-companies${page ? ' rs-page' : ''}`} id="companies" aria-labelledby="companies-title">
    <div className="rs-wrap">
      <div className="rs-head-row" data-reveal>
        <Heading page={page} id="companies-title"><Rise>Products</Rise><Rise n={1}>we’ve shipped.</Rise></Heading>
        <p className="rs-lead">Built by Spencer and live now. Each is its own company with its own data, credentials, and permissions.</p>
      </div>
      <div className="rs-co-list">
        {companies.map((c, index) => <a key={c.name} className="rs-co" href={c.url} target="_blank" rel="noreferrer" data-reveal style={{ '--d': `${index * 110}ms` }}>
          <img src={c.logo} width="44" height="44" alt="" />
          <span className="rs-co-name"><strong>{c.name}</strong><span className="rs-mono">{c.host}</span></span>
          <span className="rs-co-body"><p>{c.desc}</p><small>{c.status}</small></span>
          <span className="rs-co-go" aria-hidden="true"><ArrowOut /></span>
        </a>)}
      </div>
      <p className="rs-note" data-reveal>The products are live. None of them runs on the improvement systems yet.</p>
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
        <p>I build and ship products myself. UTern, LEED, and Ballot Watch are live, and this site is kept up by the loop it describes. UTern runs independently of the studio.</p>
        <p>Who owns the code, what access we need, who approves releases, and what ongoing support includes all go in the written scope, agreed before any work starts.</p>
        <ul className="rs-shipped" aria-label="Shipped work">
          {companies.map(c => <li key={c.name}><a href={c.url} target="_blank" rel="noreferrer"><strong>{c.name}</strong><span>{c.host}</span><ArrowOut /></a></li>)}
          <li><a href={COMMIT} target="_blank" rel="noreferrer"><strong>The loop’s first release</strong><span>sparktechstudio.com</span><ArrowOut /></a></li>
        </ul>
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
  if (state === 'sent') return <p className="rs-form-done" role="status">Got it. You’ll hear back within 2 business days.</p>
  return <form className="rs-form" onSubmit={submit} noValidate>
    <label className="rs-field"><span>Name</span><input name="name" type="text" autoComplete="name" maxLength={120} /></label>
    <label className="rs-field"><span>Email</span><input name="email" type="email" autoComplete="email" required maxLength={200} /></label>
    <label className="rs-field rs-field-wide"><span>What you’re building, or what keeps breaking</span><textarea name="message" rows={5} required minLength={10} maxLength={4000} /></label>
    <label className="rs-field rs-hp" aria-hidden="true"><span>Company website</span><input name="company_website" type="text" tabIndex={-1} autoComplete="off" /></label>
    <div className="rs-form-actions">
      <button className="rs-button" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send to the studio'} <ArrowOut /></button>
      <p className="rs-form-privacy">We use what you send only to reply. <Link to="/privacy">Privacy</Link></p>
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
          <p className="rs-cta-copy">Tell us what you want built, or what keeps breaking. Here’s what happens next.</p>
          <ol className="rs-next">
            <li>We reply within 2 business days.</li>
            <li>If it’s a fit, we set up a call.</li>
            <li>You get a written scope with the price and timeline. Nothing starts until you approve it.</li>
          </ol>
          <a className="rs-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
        <ContactForm />
      </div>
    </div>
  </section>
}

function Privacy() {
  return <section className="rs-section rs-page rs-privacy" aria-labelledby="privacy-title">
    <div className="rs-wrap rs-privacy-grid">
      <h1 id="privacy-title" data-reveal><Rise>Privacy.</Rise></h1>
      <div className="rs-privacy-copy" data-reveal style={{ '--d': '120ms' }}>
        <p className="rs-about-lead">Short version: what you send us is used to reply to you.</p>
        <h3>What the contact form collects</h3>
        <p>Your name if you give it, your email, and your message. The form also sends a hidden field that only bots fill in.</p>
        <h3>Where it goes</h3>
        <p>The message is emailed to the studio inbox through Resend, our email provider. Your IP address is included in that email so we can spot spam, and it is held briefly in server memory to limit repeat submissions.</p>
        <h3>What we do with it</h3>
        <p>We use it to reply and to talk about your project. We don’t sell it and we don’t add you to a mailing list.</p>
        <h3>Analytics and cookies</h3>
        <p>This site runs no analytics, ads, or tracking cookies. It is hosted on Vercel, which keeps standard server logs.</p>
        <h3>Deleting your data</h3>
        <p>Write to <a className="rs-email" href={`mailto:${EMAIL}`}>{EMAIL}</a> and we’ll delete your messages.</p>
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
          <p>We build your product and ship it, then keep improving it with AI systems now in pilot.</p>
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
  '/build': 'What we build | SparkTech Studio',
  '/idea': 'The idea | SparkTech Studio',
  '/how-its-built': 'How it’s built | SparkTech Studio',
  '/workflows': 'Workflows | SparkTech Studio',
  '/companies': 'Companies | SparkTech Studio',
  '/about': 'About | SparkTech Studio',
  '/contact': 'Contact | SparkTech Studio',
  '/privacy': 'Privacy | SparkTech Studio',
}

export default function VentureSite() {
  const path = usePath()
  useReveal(path)
  useEffect(() => { document.title = titles[path] || titles['/'] }, [path])

  let body
  switch (path) {
    case '/build': body = <><Offer page /><Proof /><Contact /></>; break
    case '/idea': body = <><Idea page /><Built /><Contact /></>; break
    case '/how-its-built': body = <><Built page /><Workflows /><Contact /></>; break
    case '/workflows': body = <><Workflows page /><Proof /><Contact /></>; break
    case '/companies': body = <><Companies page /><Proof /><About /><Contact /></>; break
    case '/about': body = <><About page /><Contact /></>; break
    case '/contact': body = <><Contact page /></>; break
    case '/privacy': body = <><Privacy /></>; break
    default: body = <><Hero /><Offer /><Idea /><Built /><Workflows /><Proof /><Companies /><About /><Contact /></>
  }

  return <div className="rs-site" id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="rs-frame" aria-hidden="true" />
    <Nav path={path} />
    <main id="main" key={path}>{body}</main>
    <Footer />
  </div>
}
