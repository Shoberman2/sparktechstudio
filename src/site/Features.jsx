import { useEffect, useRef, useState } from 'react'

// Home, the services wheel with the gold check (the founder, 2026-11-18: "more like a slot wheel and when you scroll
// it's a new option with a bigger description to the right"; 2026-11-21: "bring the checkmarks design back").
// The section pins while you scroll. On the left the service names turn on a reel past a fixed gold check;
// on the right the claim and a device picture of the service swap in as each name lands.
// All motion follows scroll; nothing plays on its own ("it looks too animated").
// Real brands, at the founder's request: UTern, Leed and BallotWatch on the startups picture only. The bakery and its customers are examples.
// The pictures (public/home/fx) are real UI rendered from scripts/scenes, with CC0 photographs and live-site captures (2026-11-22,
// founder: "make them look less AI"). They replace the generated photographs. Edit a scene and run scripts/scenes/render.sh.
// Without JavaScript or with reduced motion (no html.rv) the reel is hidden and the services read as a plain list.

// A ticked box on the reel: an empty ring until its name comes up, then a gold disc whose check draws in
const Ring = () => <svg className="rc" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" /><path d="M7.2 12.4l3.2 3.2 6.4-6.8" pathLength="1" /></svg>
const Tick = () => <svg className="fx-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.8l5 5L19.5 7" /></svg>

const items = [
  { id: 'seo', name: 'SEO', claim: 'Number One On Google.', img: '/home/fx/seo.jpg', alt: "Google on an iPhone: the search \"bakery near me\" shows Maple & Rye Bakery, an example business, as the first result." },
  { id: 'aeo', name: 'AEO', claim: 'Get Mentioned In AI Chats.', img: '/home/fx/aeo.jpg', alt: "ChatGPT on an iPhone naming Maple & Rye Bakery, an example business, as the place to get sourdough, with its site as the source." },
  { id: 'design', name: 'Modern Design', claim: 'A Site That Looks World Class.', img: '/home/fx/design.jpg', alt: "An example bakery's dated website in an old browser window, beside its new site on a MacBook and an iPhone." },
  { id: 'build', name: 'We Build It', claim: 'From A Call To A Live Site.', img: '/home/fx/build.jpg', alt: "The example bakery's site in a code editor on a MacBook, the terminal showing it live in production, and the finished site on an iPhone." },
  { id: 'maintain', name: 'We Maintain It', claim: 'It Breaks. We Fix It.', img: '/home/fx/maintain.jpg', alt: "One iPhone shows the bakery's order page down with a server error. The iPhone in front shows it working again, with a message that it is fixed." },
  { id: 'new-features', name: 'New Features', claim: 'Ask For It. We Ship It.', img: '/home/fx/features.jpg', alt: "The bakery's owner asks SparkTech Studios for gift cards in Messages and hears they are live. Beside it, the new gift card page on the site." },
  { id: 'ai-agents', name: 'AI Agents', claim: 'AI That Answers For You.', img: '/home/fx/agents.jpg', alt: "A text conversation at 9:14 PM where the bakery's AI agent shows its chocolate cake and takes a birthday cake order for Saturday." },
  { id: 'apps', name: 'Apps', claim: 'AI Apps And Web Apps.', img: '/home/fx/apps.jpg', alt: "The bakery's orders app on a MacBook: an AI summary of the morning above today's pickups and their status." },
  { id: 'startups', name: 'Startups', claim: 'We Build Out Startups Too.', img: '/home/fx/startups.jpg', alt: "The live UTern, Leed and BallotWatch websites on three iPhones." },
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
            <figure className="fx-pic fx-shot"><picture>
              {/* Phones get the portrait (4:5) render of the same scene, with the devices drawn larger */}
              <source media="(max-width: 760px)" srcSet={x.img.replace('.jpg', '-m.webp')} width="1080" height="1350" />
              <img src={x.img.replace('.jpg', '.webp')} srcSet={`${x.img.replace('.jpg', '-900.webp')} 900w, ${x.img.replace('.jpg', '.webp')} 1600w`} sizes="50vw" alt={x.alt} width="1600" height="1080" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
            </picture></figure>
          </article>)}
        </div>
      </div>
    </div>
  </section>
}
