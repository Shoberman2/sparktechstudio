import { useEffect, useRef, useState } from 'react'

// Home, the services wheel with the gold check (the founder, 2026-11-18: "more like a slot wheel and when you scroll
// it's a new option with a bigger description to the right"; 2026-11-21: "bring the checkmarks design back").
// The section pins while you scroll. On the left the service names turn on a reel past a fixed gold check;
// on the right the claim and a device picture of the service swap in as each name lands.
// All motion follows scroll; nothing plays on its own ("it looks too animated").
// Real brands, at the founder's request: UTern, Leed and BallotWatch on the startups picture only. The bakeries and their customers are examples.
// Without JavaScript or with reduced motion (no html.rv) the reel is hidden and the services read as a plain list.

// A ticked box on the reel: an empty ring until its name comes up, then a gold disc whose check draws in
const Ring = () => <svg className="rc" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" /><path d="M7.2 12.4l3.2 3.2 6.4-6.8" pathLength="1" /></svg>
const Tick = () => <svg className="fx-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.8l5 5L19.5 7" /></svg>

const items = [
  { id: 'seo', name: 'SEO', claim: 'Number One On Google.', img: '/home/fx/seo.jpg', alt: 'An iPhone showing Maple and Rye Bakery, an example business, first on a Google search.' },
  { id: 'aeo', name: 'AEO', claim: 'Get Mentioned In AI Chats.', img: '/home/fx/aeo.jpg', alt: 'ChatGPT on an iPhone recommending Maple and Rye Bakery by name, an example business.' },
  { id: 'design', name: 'Modern Design', claim: 'A Site That Looks World Class.', img: '/home/fx/design.jpg', alt: 'A dated 1990s bakery site on an old monitor beside the new site on a MacBook and an iPhone.' },
  { id: 'build', name: 'We Build It', claim: 'From A Call To A Live Site.', img: '/home/fx/build.jpg', alt: 'A bakery site being built in a code editor on a MacBook, with the finished site on an iPhone.' },
  { id: 'maintain', name: 'We Maintain It', claim: 'It Breaks. We Fix It.', img: '/home/fx/maintain.jpg', alt: 'One iPhone shows a page error. The iPhone in front shows the same site back up, marked fixed.' },
  { id: 'new-features', name: 'New Features', claim: 'Ask For It. We Ship It.', img: '/home/fx/features.jpg', alt: 'A bakery site on an iPhone with three new features, beside chips reading bookings, gift cards and menu live.' },
  { id: 'ai-agents', name: 'AI Agents', claim: 'AI That Answers For You.', img: '/home/fx/agents.jpg', alt: 'A text conversation where a business\'s AI agent takes a birthday cake order at 9:14 PM.' },
  { id: 'apps', name: 'Apps', claim: 'AI Apps And Web Apps.', img: '/home/fx/apps.jpg', alt: 'A business dashboard on a MacBook with orders and an AI summary of the day.' },
  { id: 'startups', name: 'Startups', claim: 'We Build Out Startups Too.', img: '/home/fx/startups.jpg', alt: 'Three iPhones showing UTern, Leed and BallotWatch.' },
]

const STEP = 26 // degrees between names on the reel

export default function Features() {
  const root = useRef(null), reel = useRef(null)
  const [active, setActive] = useState(-1)
  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rows = [...reel.current.children]
    let raf = 0
    const paint = () => {
      raf = 0
      const r = el.getBoundingClientRect(), span = r.height - innerHeight
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0
      // Rest on each name, then ease to the next
      const raw = p * (items.length - 1), base = Math.floor(raw), t = raw - base
      const f = base + t * t * (3 - 2 * t)
      rows.forEach((row, i) => {
        const d = i - f
        row.style.transform = `rotateX(${(-d * STEP).toFixed(2)}deg) translateZ(var(--r))`
        row.style.opacity = Math.max(0, 1 - Math.abs(d) * 0.6).toFixed(3)
        row.classList.toggle('hit', Math.abs(d) < 0.5)
        row.classList.toggle('done', d <= -0.5)
      })
      setActive(r.top > innerHeight * 0.55 || r.bottom < innerHeight * 0.3 ? -1 : Math.round(f))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(paint) }
    // Footer links point at one service (/#seo, /#apps...). Scroll to the point where the reel lands on it.
    // The panel with that id sits inside the pinned stage, so the browser's own jump would land in the wrong place.
    const spot = i => el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * i / (items.length - 1)
    const jump = () => {
      const i = items.findIndex(x => x.id === location.hash.slice(1))
      if (i < 0) return
      setTimeout(() => scrollTo({ top: spot(i), behavior: 'instant' }), 160)
    }
    // On the home page, catch every click on a service link, including a second click on the same one (no hashchange
    // fires then), and glide the reel to that service.
    const click = e => {
      const a = e.target.closest?.('a[href]')
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const url = new URL(a.getAttribute('href'), location.href)
      if (url.pathname !== location.pathname || !url.hash) return
      const i = items.findIndex(x => x.id === url.hash.slice(1))
      if (i < 0) return
      e.preventDefault()
      if (location.hash !== url.hash) history.pushState(null, '', url.hash)
      scrollTo({ top: spot(i), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }
    on(); jump()
    addEventListener('hashchange', jump)
    document.addEventListener('click', click)
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); removeEventListener('hashchange', jump); document.removeEventListener('click', click); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return <section ref={root} className="wheel" id="services" aria-labelledby="wheel-title" style={{ '--n': items.length }}>
    <div className="wheel-pin">
      <h2 id="wheel-title" className="sr">Services</h2>
      <div className="wrap wheel-in">
        <div className="wheel-slot" aria-hidden="true">
          <ul ref={reel} className="wheel-reel">{items.map((x, i) => <li key={x.id} className={i === 0 ? 'hit' : undefined} style={{ transform: `rotateX(${-i * STEP}deg) translateZ(var(--r))`, opacity: Math.max(0, 1 - i * 0.6) }}><Ring />{x.name}</li>)}</ul>
        </div>
        <div className="wheel-panels">
          {items.map((x, i) => <article key={x.id} id={x.id} className={`fx${i === active ? ' on' : ''}`}>
            <div className="fx-text">
              <h3 className="wheel-name"><Tick />{x.name}</h3>
              <p className="fx-claim">{x.claim}</p>
            </div>
            <figure className="fx-pic fx-shot"><img src={x.img.replace('.jpg', '.webp')} srcSet={`${x.img.replace('.jpg', '-900.webp')} 900w, ${x.img.replace('.jpg', '.webp')} 1600w`} sizes="(max-width: 760px) 92vw, 50vw" alt={x.alt} width="1600" height="1080" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" /></figure>
          </article>)}
        </div>
      </div>
    </div>
  </section>
}
