import { useEffect, useRef } from 'react'

// Home, How It Works (2026-11-25). Spencer, on the bare river under the hero: "add more information to the website here",
// "make sure it is stylish", then "Put the How it Works above the different features".
// The reel's ticked ring laid flat: one thin line through four stops. As you scroll, the line fills gold and each ring
// becomes a gold disc with its check drawn in. Scrolling back un-fills it, as the reel does. Nothing plays on its own.
// The finished state is the default: without JavaScript or with reduced motion (no html.rv) the whole path shows complete.

// Same ring as the reel (Features.jsx), so it picks up the shared .rc styles and transitions
const Ring = () => <svg className="rc" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" /><path d="M7.2 12.4l3.2 3.2 6.4-6.8" pathLength="1" /></svg>

// Facts the site already states: `steps` in src/designs/pages.jsx and the home FAQ in Home.jsx. No numbers, no price.
const stops = [
  ['Book A Call', 'Tell us what you want built.'],
  ['Written Scope', 'What we build, what it costs and when.'],
  ['Live In Days', 'Designed, built, tested and launched.'],
  ['Monthly Updates', 'Fixes and your changes, in the same monthly price.'],
]

const clamp = v => Math.min(1, Math.max(0, v))

export default function Path() {
  const rail = useRef(null)
  useEffect(() => {
    const el = rail.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rows = [...el.children], n = rows.length
    const phone = matchMedia('(max-width: 760px)')
    let raf = 0
    const paint = () => {
      raf = 0
      const h = innerHeight
      // Ring centers on screen. Phones stack the stops, so the tip of the fill follows a line 72% down the screen,
      // segment by segment (rows differ in height when a line wraps). Wide screens: the rail fills as it rises from the
      // bottom of the screen and is complete by the time it is centered on screen.
      const c = rows.map(li => { const r = li.querySelector('.rc').getBoundingClientRect(); return r.top + r.height / 2 })
      let s, done
      if (phone.matches) {
        const y = 0.72 * h
        s = rows.map((_, i) => i < n - 1 ? clamp((y - c[i]) / (c[i + 1] - c[i])) : 0)
        done = rows.map((_, i) => y >= c[i])
      } else {
        const p = clamp((0.86 * h - el.getBoundingClientRect().top) / (0.36 * h))
        s = rows.map((_, i) => clamp(p * (n - 1) - i))
        done = rows.map((_, i) => p > 0 && p * (n - 1) >= i - 1e-6)
      }
      rows.forEach((li, i) => {
        li.style.setProperty('--s', s[i].toFixed(4))
        li.classList.toggle('done', done[i])
      })
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(paint) }
    // The page arrives finished. Set the real state without fades, so a slow load snaps once instead of un-filling.
    el.classList.add('snap')
    paint()
    let r1 = requestAnimationFrame(() => { r1 = requestAnimationFrame(() => el.classList.remove('snap')) })
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(r1); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return <section className="path" id="how-it-works" aria-labelledby="path-title">
    <div className="wrap">
      <div className="head reveal"><h2 id="path-title">How It Works</h2></div>
      <ol ref={rail} className="path-rail" style={{ '--n': stops.length }}>
        {stops.map(([name, line]) => <li key={name}><Ring /><h3>{name}</h3><p>{line}</p></li>)}
      </ol>
    </div>
  </section>
}
