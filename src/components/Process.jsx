import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import './Process.css'

const steps = [
  ['Shape', 'We take the idea as it is and pressure-test it: who it is for, what it has to do, and what can wait.'],
  ['Build', 'Working software, fast. We build with AI and make every call about what ships.'],
  ['Launch', 'It goes live. A real product at a real address, not a demo.'],
  ['Keep going', 'We stay for the unglamorous parts: data, security, payments, cost, and edge cases.'],
]

export default function Process() {
  const listRef = useRef(null)

  // A vertical line fills as the steps scroll through the viewport.
  useEffect(() => {
    const list = listRef.current
    const items = [...list.querySelectorAll('li')]

    if (prefersReducedMotion()) {
      list.style.setProperty('--p', '1')
      items.forEach((li) => li.classList.add('is-active'))
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = list.getBoundingClientRect()
      const marker = window.innerHeight * 0.62
      const p = Math.min(1, Math.max(0, (marker - rect.top) / rect.height))
      list.style.setProperty('--p', p.toFixed(3))
      items.forEach((li) => {
        const r = li.getBoundingClientRect()
        li.classList.toggle('is-active', r.top + 24 <= marker)
      })
    }
    const queue = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="process section" id="process">
      <div className="wrap process-grid">
        <div className="process-intro" data-reveal>
          <p className="kicker">Process</p>
          <h2>From idea to live in <em>four</em> steps.</h2>
          <p className="process-sub">No handoffs and no waiting. The idea stays sharp all the way to launch.</p>
        </div>

        <ol className="process-steps" ref={listRef}>
          <span className="process-line" aria-hidden="true"><i /></span>
          {steps.map(([title, copy]) => (
            <li key={title}>
              <span className="process-node" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
