import { useRef } from 'react'
import { useLoop } from './useLoop'
import { built, EMAIL, year } from './content.jsx'
import './Form.css'

// One cloud of points that morphs between forms. The SparkTech spark is home; each product has a form of its own.
const COUNT = 3200
const TAU = Math.PI * 2
const golden = Math.PI * (3 - Math.sqrt(5))

// The spark, traced from public/logo.svg (viewBox 4 4 40 40): four rays, the center diamond, four particles. Area-weighted fill, slightly extruded.
const SPARK = (() => {
  const tris = [
    [[24, 4], [26.5, 18], [28, 14]], [[24, 44], [21.5, 30], [20, 34]], [[4, 24], [18, 21.5], [14, 20]], [[44, 24], [30, 26.5], [34, 28]],
    [[24, 18], [30, 24], [24, 30]], [[24, 18], [24, 30], [18, 24]],
  ]
  const dots = [[14, 14, 1.5], [34, 14, 1], [34, 34, 1.5], [14, 34, 1]]
  const area = ([a, b, c]) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2
  const shapes = [...tris.map(t => ({ t, a: area(t) })), ...dots.map(d => ({ d, a: Math.PI * d[2] * d[2] }))]
  const total = shapes.reduce((s, x) => s + x.a, 0)
  let seed = 3
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const out = []
  for (const s of shapes) {
    const n = Math.round((s.a / total) * COUNT)
    for (let i = 0; i < n && out.length < COUNT; i++) {
      let x, y
      if (s.t) { let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v } const [a, b, c] = s.t; x = a[0] + u * (b[0] - a[0]) + v * (c[0] - a[0]); y = a[1] + u * (b[1] - a[1]) + v * (c[1] - a[1]) }
      else { const r = s.d[2] * Math.sqrt(rnd()), q = rnd() * TAU; x = s.d[0] + Math.cos(q) * r; y = s.d[1] + Math.sin(q) * r }
      out.push([(x - 24) / 19, (y - 24) / 19, (rnd() - 0.5) * 0.08])
    }
  }
  while (out.length < COUNT) out.push(out[out.length % 100])
  return out
})()

const forms = [
  i => SPARK[i],
  i => { const y = 1 - (i / (COUNT - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * golden; return [Math.cos(a) * r, y, Math.sin(a) * r] },
  i => { const u = (i / COUNT) * TAU * 41, v = (i / COUNT) * TAU; return [(0.72 + 0.28 * Math.cos(u)) * Math.cos(v), 0.28 * Math.sin(u), (0.72 + 0.28 * Math.cos(u)) * Math.sin(v)] },
  i => { const s = i / COUNT, a = s * TAU * 5, side = i % 2 ? Math.PI : 0, r = 0.55 + 0.1 * Math.sin(i * 1.7); return [Math.cos(a + side) * r, s * 2 - 1, Math.sin(a + side) * r] },
  i => { const n = 15, x = i % n, y = Math.floor(i / n) % n, z = Math.floor(i / (n * n)) % n; return [x / (n - 1) * 1.4 - 0.7, y / (n - 1) * 1.4 - 0.7, z / (n - 1) * 1.4 - 0.7] },
  i => { const n = 57, x = (i % n) / (n - 1) * 2 - 1, z = Math.floor(i / n) / (COUNT / n - 1) * 2 - 1; return [x * 0.95, Math.sin(x * 4) * Math.cos(z * 3) * 0.28, z * 0.95] },
]
const targets = forms.map(f => Float32Array.from({ length: COUNT * 3 }, (_, k) => f(Math.floor(k / 3))[k % 3]))

// Which form the pointer has asked for; null lets the cloud cycle on its own, resting on the spark between forms
const morph = { hover: null } // reserved: a product page could hold its own form

function setup2d(ctx) {
  const pos = Float32Array.from(targets[0])
  const state = { auto: 0, last: 0, ang: 0, prev: 0, spark: 1 }
  return (w, h, t, ptr) => {
    if (morph.hover == null && t - state.last > 4.5) { state.auto = (state.auto + 1) % forms.length; state.last = t }
    const which = morph.hover ?? state.auto
    const goal = targets[which]
    // Turn freely, but settle face-on whenever the spark is showing so the logo reads
    const dt = Math.min(t - state.prev, 0.05); state.prev = t
    state.spark += ((which === 0 ? 1 : 0) - state.spark) * 0.05
    state.ang += dt * 0.32 * (1 - state.spark)
    const home = Math.round(state.ang / TAU) * TAU + Math.sin(t * 0.7) * 0.35
    state.ang += (home - state.ang) * 0.05 * state.spark
    ctx.clearRect(0, 0, w, h)
    const cx = w * 0.5, cy = h * 0.5, scale = Math.min(w, h) * 0.4
    const ry = state.ang + (ptr.x - 0.5) * 0.9, rx = -0.3 * (1 - state.spark) + (ptr.y - 0.5) * 0.6
    const sy = Math.sin(ry), cyy = Math.cos(ry), sx = Math.sin(rx), cxx = Math.cos(rx)
    const g = state.spark
    for (let i = 0; i < COUNT; i++) {
      const k = i * 3, ease = 0.035 + (i % 7) * 0.004
      pos[k] += (goal[k] - pos[k]) * ease; pos[k + 1] += (goal[k + 1] - pos[k + 1]) * ease; pos[k + 2] += (goal[k + 2] - pos[k + 2]) * ease
      const x = pos[k], y = pos[k + 1], z = pos[k + 2]
      const x1 = x * cyy - z * sy, z1 = x * sy + z * cyy
      const y1 = y * cxx - z1 * sx, z2 = y * sx + z1 * cxx
      const p = 2.6 / (2.6 + z2)
      const depth = (1 - z2) * 0.5
      const accent = i % 37 === 0
      // On the spark the cloud turns gold, the logo's own color; elsewhere it is ink with gold flecks
      const r0 = accent ? 184 : 10 + 174 * g, g0 = accent ? 134 : 10 + 124 * g, b0 = accent ? 11 : 12 - g
      ctx.fillStyle = `rgba(${r0 | 0},${g0 | 0},${b0 | 0},${accent ? 0.5 + depth * 0.5 : 0.14 + depth * 0.66})`
      const r = (accent ? 1.6 : 0.9 + g * 0.2) * p
      ctx.fillRect(cx + x1 * scale * p - r, cy + y1 * scale * p - r, r * 2, r * 2)
    }
  }
}

function Cloud({ className }) {
  const ref = useRef(null)
  useLoop(ref, setup2d)
  return <canvas ref={ref} className={className} aria-hidden="true" />
}

const SP_DOTS = [[46.5, 10.9], [46.4, 24.4], [46.5, 37.9], [73.5, 37.9], [19.4, 38], [32.9, 38], [60, 38], [32.9, 51.5], [46.4, 51.5], [5.8, 51.6], [19.3, 51.6], [46.5, 65.1], [32.6, 65.2], [32.8, 78.6]]
const tiles = {
  utern: { bg: '#101a2a url(/work/utern/mountain.webp) center 35% / cover no-repeat', img: '/work/utern/birdee.png', cls: 'is-utern' },
  leed: { bg: '#0b0b09', img: '/work/leed/sherlock.svg', cls: 'is-leed' },
  ballotwatch: { bg: '#0c1626', img: '/work/ballotwatch/capitol-logo.svg', cls: 'is-bw' },
  spacial: { bg: '#7255ff', cls: 'is-spacial' },
  budtender: { bg: 'radial-gradient(90% 80% at 40% 40%,#3f8a5e,#143b27 70%,#0b2418)', img: '/work/budtender/budzy-phone.webp', cls: 'is-bud' },
}
const Arrow = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M5 3h8v8" stroke="currentColor" strokeWidth="1.6" /></svg>

export default function Form() {
  return <div className="fm">
    <header className="fm-nav">
      <a href="/" className="fm-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</a>
      <nav><a href="#systems">Systems</a><a href="#work">Work</a><a href="#contact">Contact</a></nav>
    </header>
    <section className="fm-hero">
      <div className="fm-copy">
        <h1>We create<br />the future.</h1>
        <p>An independent studio in New York. We build the things other people only talk about.</p>
        <div className="fm-hero-actions">
          <a className="fm-cta" href="#contact"><span>Start something</span><i aria-hidden="true"><Arrow /></i></a>
          <a className="fm-cta-ghost" href="#work">See what we’ve built</a>
        </div>
      </div>
      <Cloud className="fm-canvas" />
    </section>

    <section className="fm-sys" id="systems">
      <h2>And we never<br />stop <em>improving it.</em></h2>
      <div className="fm-sys-side">
        <p>The future isn’t a launch date. We run an efficient system that keeps everything we build getting better, so what we make today is sharper tomorrow.</p>
      </div>
    </section>

    <section className="fm-built" id="work">
      <div className="fm-built-head">
        <h2>What we’ve built<br /><em>so far.</em></h2>
      </div>
      <div className="fm-tiles">
        {built.map(b => {
          const t = tiles[b.slug]
          return <a key={b.slug} href={b.url} className={`fm-tile ${t.cls}`} style={{ background: t.bg }}>
            {t.img ? <img src={t.img} alt="" /> : <svg viewBox="-4 0 102 92" aria-hidden="true" className="fm-tile-dots">{SP_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5.2" />)}</svg>}
            <span className="fm-tile-go"><Arrow /></span>
            <span className="fm-tile-text"><strong>{b.name}</strong><span>{b.line}</span></span>
          </a>
        })}
      </div>
    </section>

    <footer className="fm-foot" id="contact">
      <div className="fm-foot-cta">
        <h2>What should<br />exist <em>next?</em></h2>
        <div>
          <p>Tell us. We reply within two business days, and the first call is a real conversation, not a pitch.</p>
          <a className="fm-mailbtn" href={`mailto:${EMAIL}`}>{EMAIL} <Arrow /></a>
        </div>
      </div>
      <div className="fm-foot-grid">
        <div className="fm-foot-brand">
          <span className="fm-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</span>
          <p>An independent studio in New York. We build products, then build the systems that keep them getting better.</p>
        </div>
        <nav aria-label="Studio"><h4>Studio</h4><a href="#systems">The systems</a><a href="#work">What we’ve built</a><a href="#contact">Contact</a></nav>
        <nav aria-label="Work"><h4>Work</h4>{built.map(b => <a key={b.slug} href={b.url}>{b.name}</a>)}</nav>
        <nav aria-label="Contact"><h4>Contact</h4><a href={`mailto:${EMAIL}`}>Email</a><a href="#contact">Start a project</a></nav>
      </div>
      <div className="fm-foot-bottom"><span>© {year} SparkTech Studios, Inc.</span><span>New York</span></div>
    </footer>
  </div>
}
