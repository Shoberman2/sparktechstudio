import { useEffect, useState } from 'react'
import './Hero.css'
import Typewriter from './Typewriter'

/*
 * The hero "film" is a real terminal session, not a video of one: crisp text at
 * any resolution, no megabyte download, and the numbers stay editable.
 * Lines print whole, one after another, the way real command output does.
 */
const bootLines = [
  { label: 'scoping the idea', status: 'ok' },
  { label: 'spawning 20 agents', status: 'ok' },
  { label: 'generating', status: '4,312 lines' },
  { label: 'senior review', status: '4,312 / 4,312' },
  { label: 'hardening auth + data', status: 'ok' },
  { label: 'load test @ 10k users', status: 'pass' },
  { label: 'deploy', status: 'live' },
]

const LINE_MS = 260

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Hero() {
  // Resolved at first render so reduced motion never needs a setState in the
  // effect body (which would cascade an extra render).
  const [printed, setPrinted] = useState(() =>
    prefersReducedMotion() ? bootLines.length : 0
  )

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timers = []
    for (let i = 1; i <= bootLines.length; i += 1) {
      timers.push(setTimeout(() => setPrinted(i), 700 + i * LINE_MS))
    }
    return () => timers.forEach(clearTimeout)
  }, [])

  const done = printed >= bootLines.length

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="prompt hero-prompt">
            <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ ./sparktech --pitch
          </p>

          <h1 className="hero-headline">
            <Typewriter
              as="span"
              speed={42}
              startDelay={400}
              keepCursor
              text={[
                { t: 'AI builds it.\n' },
                { t: 'Talent', className: 'serif hero-em' },
                { t: ' scales it.' },
              ]}
            />
          </h1>

          <p className="hero-sub reveal">
            Anyone can get an app built now. Getting one to survive real users is
            a different job, and it takes engineers who understand what the AI
            just wrote. We run both halves.
          </p>

          <div className="hero-buttons reveal">
            <a href="#waitlist" className="hero-btn-primary">[ start_a_project ]</a>
            <a href="#thesis" className="hero-link">
              read_the_thesis <span className="hero-arrow">↓</span>
            </a>
          </div>
        </div>

        <aside className="hero-term" aria-label="Example build session">
          <div className="hero-term-bar">
            <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="hero-term-title">build.sh</span>
          </div>
          <div className="hero-term-body">
            <p className="boot-cmd">
              <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ ./build --new
            </p>
            <ul className="boot-list">
              {bootLines.slice(0, printed).map((l) => (
                <li className="boot-row" key={l.label}>
                  <span className="boot-arrow" aria-hidden="true">&gt;</span>
                  <span className="boot-label">{l.label}</span>
                  <span className="boot-leader" aria-hidden="true" />
                  <span className="boot-status">{l.status}</span>
                </li>
              ))}
            </ul>
            {done && (
              <p className="boot-cmd boot-final">
                <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>${' '}
                <span className="tw-caret" aria-hidden="true" />
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
