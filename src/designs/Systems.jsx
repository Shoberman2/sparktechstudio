import { useEffect } from 'react'
import { systems, CALENDLY, EMAIL, year, built } from './content.jsx'
import './Systems.css'

// The program, told broadly: what the system does, the loop it runs, where it runs, and the limits people keep.
// No individual agents or their tasks here; that detail stays out of the site on purpose.
const loop = [
  ['Observe', 'It watches how the product is actually used and what goes wrong.'],
  ['Decide', 'It picks one improvement worth making, with a reason.'],
  ['Build', 'It makes the change in an isolated copy, inside limits a person set.'],
  ['Verify', 'It retests in a real browser before anything ships.'],
  ['Learn', 'It records what happened, so the next run starts smarter.'],
]

const Arrow = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M5 3h8v8" stroke="currentColor" strokeWidth="1.6" /></svg>

export default function Systems() {
  useEffect(() => { document.title = 'The system | SparkTech Studio' }, [])
  return <div className="sy">
    <header className="sy-nav">
      <a href="/" className="sy-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</a>
      <nav><a href="/#work">Work</a><a href="/#contact">Contact</a></nav>
    </header>
    <main id="main">
      <section className="sy-hero">
        <p className="sy-kicker">The system</p>
        <h1>Software that keeps<br />getting <em>better.</em></h1>
        <p className="sy-lede">Most software starts aging the day it launches. We built a system that keeps a product, and the company around it, moving forward long after launch. It works in a loop, it keeps a record of every run, and people stay in charge of the goals, the budget, and the limits.</p>
      </section>

      <section className="sy-loop" aria-labelledby="loop-title">
        <div className="sy-head">
          <h2 id="loop-title">One loop, <em>run on repeat.</em></h2>
          <p>Five steps, the same every time. The line comes back to the start because it never stops.</p>
        </div>
        <div className="sy-track">
          <span className="sy-line" aria-hidden="true"><i /></span>
          <ol>
            {loop.map(([name, copy]) => <li key={name}><h3>{name}</h3><p>{copy}</p></li>)}
          </ol>
          <p className="sy-return"><svg width="64" height="28" viewBox="0 0 64 28" fill="none" aria-hidden="true"><path d="M62 4H18a12 12 0 0 0 0 24h8" stroke="#b8860b" strokeWidth="1.4" /><path d="M22 22l4 6 4-6" stroke="#b8860b" strokeWidth="1.4" /></svg>and back to the start.</p>
        </div>
      </section>

      <section className="sy-where" aria-labelledby="where-title">
        <div className="sy-head">
          <h2 id="where-title">Where it <em>runs.</em></h2>
          <p>The same loop, pointed at different parts of a company. Product is live. The rest is where it goes next.</p>
        </div>
        <ul className="sy-areas">
          {systems.areas.map(([name, copy, live]) => <li key={name} className={live ? 'is-live' : ''}><strong>{name}</strong><span>{copy}</span><em>{live ? 'Live' : 'Next'}</em></li>)}
        </ul>
      </section>

      <section className="sy-rules" aria-labelledby="rules-title">
        <div className="sy-head">
          <h2 id="rules-title">The limits <em>people keep.</em></h2>
        </div>
        <ul className="sy-rulelist">
          <li><strong>Each company stays its own.</strong><span>Its own data, credentials, brand, goals, and budget. Nothing crosses that line.</span></li>
          <li><strong>A person sets the scope.</strong><span>What it may touch, how much it may spend, and for how long. Approval is specific, and it expires.</span></li>
          <li><strong>Nothing ships unverified.</strong><span>Every change is reproduced, fixed in isolation, and retested in a real browser before it goes live.</span></li>
          <li><strong>Everything is on the record.</strong><span>What it saw, what it changed, what it checked, and what it learned. Kept as evidence, every run.</span></li>
        </ul>
      </section>

      <section className="sy-status">
        <p className="sy-kicker">Where this stands</p>
        <p className="sy-status-line">Today the loop runs on our own site. On October 11, 2026 it found a bug there, fixed it, verified the fix, and shipped it to production on its own in a few minutes. The products we’ve built are next, one at a time, starting with a single real pilot.</p>
        <div className="sy-actions">
          <a className="sy-cta" href={CALENDLY} target="_blank" rel="noreferrer"><span>Book a 30-minute call</span><i aria-hidden="true"><Arrow /></i></a>
          <a className="sy-ghost" href="/#work">See what we’ve built</a>
        </div>
      </section>
    </main>
    <footer className="sy-foot">
      <nav aria-label="Work">{built.map(b => <a key={b.slug} href={b.url}>{b.name}</a>)}</nav>
      <div><span>© {year} SparkTech Studios, Inc. · <a href="/privacy">Privacy</a></span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
    </footer>
  </div>
}
