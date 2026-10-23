import Footer from './Footer.jsx'
import './buttons.css'
import './Systems.css'

// The system, told as one picture: a loop that keeps running. Five steps, where it points, what never changes, where it stands.
// Deliberately broad. No individual agents or their tasks are named anywhere on the site.
const loop = [
  ['Observe', 'See what’s really happening.'],
  ['Decide', 'Pick one thing worth improving.'],
  ['Build', 'Make the change, inside set limits.'],
  ['Verify', 'Test it for real before it ships.'],
  ['Learn', 'Remember it for next time.'],
]
const areas = [['Product', true], ['Growth'], ['Content'], ['Support'], ['Knowledge']]
const keeps = [
  ['People set the limits.', 'What it may touch, how much it may spend, and for how long.', <path key="p" d="M14 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9c0-4 4-6.5 9-6.5s9 2.5 9 6.5" />],
  ['Nothing ships unverified.', 'Every change is tested in a real browser before it goes live.', <path key="s" d="M14 3 5 6.5v6c0 5.5 3.8 9.6 9 11.5 5.2-1.9 9-6 9-11.5v-6L14 3Zm-4 11 3 3 5-6" />],
  ['Every run is on the record.', 'What it saw, what it changed, and what it learned, kept as evidence.', <path key="d" d="M8 3h8l5 5v16H8V3Zm8 0v5h5M11 14h7M11 18h7" />],
]

// Points on the ring, starting at the top and running clockwise
const R = 230, C = 320
const at = (i, r = R) => { const a = -Math.PI / 2 + (i / loop.length) * Math.PI * 2; return [C + Math.cos(a) * r, C + Math.sin(a) * r] }
const anchor = i => (i === 0 ? 'middle' : i < loop.length / 2 ? 'start' : 'end')

function Ring() {
  return <svg className="sy-ring" viewBox="0 0 640 640" role="img" aria-label="A loop of five steps: observe, decide, build, verify, learn, then back to observe.">
    <circle className="sy-ring-base" cx={C} cy={C} r={R} />
    <circle className="sy-ring-trail" cx={C} cy={C} r={R} pathLength="100" />
    <g className="sy-ring-dot"><circle cx={C} cy={C - R} r="7" /></g>
    {loop.map(([name], i) => {
      const [x, y] = at(i); const [lx, ly] = at(i, R + 40)
      return <g key={name} className="sy-node" style={{ '--d': `${i * 2}s` }}>
        <circle cx={x} cy={y} r="9" />
        <text x={lx} y={ly + (i === 0 ? -4 : 7)} textAnchor={anchor(i)}>{name}</text>
      </g>
    })}
    <image href="/logo.svg" x={C - 34} y={C - 46} width="68" height="68" />
    <text className="sy-ring-center" x={C} y={C + 52} textAnchor="middle">and again</text>
  </svg>
}

export default function Systems() {
  return <div className="sy">
    <header className="sy-nav">
      <a href="/" className="sy-mark"><img src="/logo.svg" width="18" height="18" alt="" />Sparktech Studios</a>
      <nav><a href="/systems" aria-current="page">System</a><a href="/#work">Work</a><a href="#contact">Contact</a></nav>
    </header>
    <main id="main">
      <section className="sy-hero">
        <p className="sy-kicker">System</p>
        <h1>Software that keeps<br />getting <em>better.</em></h1>
        <p className="sy-lede">Most software starts aging the day it launches. Ours runs in a loop that never stops improving it, with people in charge of what it may touch.</p>
      </section>

      <section className="sy-loop" aria-labelledby="loop-title">
        <div className="sy-loop-grid">
          <Ring />
          <div>
            <h2 id="loop-title">One loop,<br />on <em>repeat.</em></h2>
            <ol className="sy-steps">
              {loop.map(([name, copy], i) => <li key={name} style={{ '--d': `${i * 2}s` }}><span className="sy-n">0{i + 1}</span><div><h3>{name}</h3><p>{copy}</p></div></li>)}
            </ol>
          </div>
        </div>
      </section>

      <section className="sy-where" aria-labelledby="where-title">
        <div className="sy-head">
          <h2 id="where-title">Where it <em>points.</em></h2>
          <p>The same loop, aimed at different parts of a company. Product first. The rest is next.</p>
        </div>
        <ul className="sy-areas">
          {areas.map(([name, live]) => <li key={name} className={live ? 'is-live' : ''}>{name}<em>{live ? 'Live' : 'Next'}</em></li>)}
        </ul>
      </section>

      <section className="sy-keeps" aria-labelledby="keeps-title">
        <div className="sy-head">
          <h2 id="keeps-title">What never <em>changes.</em></h2>
        </div>
        <ul className="sy-keeplist">
          {keeps.map(([title, copy, icon]) => <li key={title}><svg viewBox="0 0 28 28" aria-hidden="true">{icon}</svg><strong>{title}</strong><span>{copy}</span></li>)}
        </ul>
      </section>

      <section className="sy-status">
        <p className="sy-kicker">Where this stands</p>
        <p className="sy-status-line">Today the loop runs on our own site. On October 11, 2026 it found a bug there, fixed it, verified the fix, and shipped it on its own. The products we’ve built are next, one at a time.</p>
      </section>
    </main>
    <Footer />
  </div>
}
