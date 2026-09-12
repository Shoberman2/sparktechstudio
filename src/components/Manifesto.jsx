import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import './Manifesto.css'

// One paragraph, set large on a dark band. The words are muted and fill to
// full strength one after another as the reader scrolls through.
const tokens = [
  ['An idea is easy to have and hard to finish.'],
  ['Most never get built because building feels like the hard part.'],
  ['That is the part we do.', true],
  ['You bring the thing you keep coming back to.'],
  ['We turn it into something real that people can use.'],
]

const words = tokens.flatMap(([sentence, em]) =>
  sentence.split(' ').map((word) => ({ word, em: Boolean(em) })),
)

export default function Manifesto() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (prefersReducedMotion()) {
      el.style.setProperty('--p', '1.2')
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * 0.85
      const end = vh * 0.3
      const p = (start - rect.top) / (start - end)
      el.style.setProperty('--p', Math.min(1.2, Math.max(0, p)).toFixed(3))
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
    <section className="manifesto" aria-label="What we believe">
      <div className="wrap">
        <p className="manifesto-text" ref={ref}>
          {words.map(({ word, em }, index) => (
            <span
              key={`${word}-${index}`}
              className={em ? 'manifesto-em' : undefined}
              style={{ '--i': (index / words.length).toFixed(3) }}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
