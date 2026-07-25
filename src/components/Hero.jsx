import { useEffect, useState } from 'react'
import './Hero.css'

/*
 * The hero background is a real terminal printing itself out, not a video of
 * one. Generated video renders text as garbled pseudo-glyphs, and the whole
 * point here is that the payoff line is legible. This also ships ~0KB.
 */
const stream = [
  '$ ./sparktech --boot',
  'runtime ........................ ok',
  'context window ................. 1,000,000',
  'agents spawned ................. 20',
  'indexing repo .................. 84,219 files',
  '',
  '$ ./build --new',
  'scoping ........................ ok',
  'scaffolding .................... ok',
  'generating ..................... 4,312 lines',
  'generating ..................... 8,904 lines',
  'generating ..................... 14,271 lines',
  'tests written .................. 1,208',
  'tests passing .................. 1,208 / 1,208',
  '',
  '$ ./review --senior',
  'reading every line ............. 14,271',
  'architecture ................... rewritten',
  'auth + data .................... hardened',
  'cost per request ............... cut 71%',
  'load test @ 10k users .......... pass',
  '',
  '$ ./ship',
  'deploying ...................... live',
  'uptime ......................... 100%',
  '',
  '$ _',
]

const STREAM_MS = 52

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Hero() {
  const [printed, setPrinted] = useState(() =>
    prefersReducedMotion() ? stream.length : 0
  )

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timers = []
    for (let i = 1; i <= stream.length; i += 1) {
      timers.push(setTimeout(() => setPrinted(i), i * STREAM_MS))
    }
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section className="hero">
      <div className="hero-stream" aria-hidden="true">
        {stream.slice(0, printed).map((line, i) => (
          <p
            className={`stream-line${line.startsWith('$') ? ' stream-cmd' : ''}`}
            key={`${line}-${i}`}
          >
            {line || ' '}
          </p>
        ))}
      </div>

      <div className="hero-inner">
        <p className="prompt hero-prompt">
          <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ ./sparktech --pitch
        </p>

        <h1 className="hero-headline">
          AI is here.<span className="tw-caret" aria-hidden="true" />
        </h1>

        <p className="hero-thesis reveal">
          AI builds it. <span className="serif hero-em">Talent</span> scales it.
        </p>

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
    </section>
  )
}
