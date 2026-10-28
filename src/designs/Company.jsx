import { useEffect, useRef } from 'react'
import { useLoop } from './useLoop'
import { companies, studies, workSlugs, EMAIL, CALENDLY, year } from './content.jsx'
import './buttons.css'
import './Company.css'

const SP_DOTS = [[46.5, 10.9], [46.4, 24.4], [46.5, 37.9], [73.5, 37.9], [19.4, 38], [32.9, 38], [60, 38], [32.9, 51.5], [46.4, 51.5], [5.8, 51.6], [19.3, 51.6], [46.5, 65.1], [32.6, 65.2], [32.8, 78.6]]

// Spacial Health's dot mark, drawn from the brand's own coordinates
const SpacialMark = () => <svg viewBox="-4 0 102 92" className="co-spmark" role="img" aria-label="Spacial Health mark">
  {SP_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5.2" style={{ '--i': i }} />)}
</svg>

/* ---------- Vision animations, one per company ---------- */

// UTern: the climb from enrollment to the summit. Shipped steps are solid, coming steps are open; Birdee walks the ridge.
function Climb({ c }) {
  const steps = [...c.today.map(t => [t, true]), ...c.vision.map(t => [t, false])]
  const path = 'M20 470 C 140 440, 170 380, 250 360 S 380 300, 430 250 S 560 170, 600 140 S 720 60, 780 34'
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const line = el.querySelector('.cl-path'), bird = el.querySelector('.cl-bird')
    const len = line.getTotalLength()
    let raf = 0, t0 = performance.now()
    const tick = now => {
      const k = ((now - t0) / 14000) % 1
      const p = line.getPointAtLength(len * (k < .9 ? k / .9 : 1))
      bird.setAttribute('transform', `translate(${p.x - 22} ${p.y - 46})`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const pts = steps.map((_, i) => i / (steps.length - 1))
  return <div className="cl" style={{ backgroundImage: 'url(/work/utern/night.webp)' }}>
    <svg ref={ref} viewBox="0 0 800 500" className="cl-svg" aria-hidden="true">
      <path className="cl-ridge" d="M0 500 L 0 480 C 140 450, 170 390, 250 370 S 380 310, 430 260 S 560 180, 600 150 S 720 70, 780 44 L 800 40 L 800 500 Z" />
      <path className="cl-path" d={path} />
      <ClimbDots path={path} pts={pts} steps={steps} />
      <g className="cl-bird"><image href="/work/utern/birdee.webp" width="44" height="44" /></g>
      <text x="20" y="494" className="cl-cap">Enrollment</text>
      <text x="780" y="20" className="cl-cap" textAnchor="end">Employment</text>
    </svg>
    <div>
      <ol className="cl-list">{steps.map(([t, done]) => <li key={t} data-done={done || undefined}>{t}</li>)}</ol>
      <p className="cl-legend"><span>● Live today</span><span>○ Coming</span></p>
    </div>
  </div>
}

// Places the step markers along the path once the browser can measure it
function ClimbDots({ path, pts, steps }) {
  const g = useRef(null)
  useEffect(() => {
    const host = g.current
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    probe.setAttribute('d', path)
    host.appendChild(probe)
    const len = probe.getTotalLength()
    host.querySelectorAll('circle').forEach((c, i) => { const p = probe.getPointAtLength(len * pts[i]); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y) })
    probe.remove()
  }, [path, pts])
  return <g ref={g}>{steps.map(([t, done], i) => <circle key={t} r={done ? 5 : 6} className={done ? 'cl-done' : 'cl-next'} style={{ '--i': i }} />)}</g>
}

// Leed: scattered newsrooms send tips along curves into a few story clusters that brighten as leads arrive.
function setupSignals(ctx) {
  const rnd = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(7)
  const rooms = Array.from({ length: 46 }, () => ({ x: .04 + rnd() * .62, y: .1 + rnd() * .8, p: rnd() * 6 }))
  const clusters = [{ x: .82, y: .32 }, { x: .88, y: .6 }, { x: .76, y: .78 }]
  const tips = []
  let last = 0
  return (w, h, t) => {
    if (t - last > .05) { last = t; const r = rooms[(rnd() * rooms.length) | 0]; tips.push({ r, c: clusters[(rnd() * 3) | 0], s: t, d: 2.4 + rnd() * 1.6 }) }
    ctx.clearRect(0, 0, w, h)
    for (const r of rooms) {
      const a = .35 + .3 * Math.sin(t * 1.3 + r.p)
      ctx.fillStyle = `rgba(240,236,226,${a})`; ctx.beginPath(); ctx.arc(r.x * w, r.y * h, 2.2, 0, 7); ctx.fill()
    }
    for (let i = tips.length - 1; i >= 0; i--) {
      const k = (t - tips[i].s) / tips[i].d
      if (k >= 1) { tips[i].c.heat = Math.min((tips[i].c.heat || 0) + .25, 1.6); tips.splice(i, 1); continue }
      const { r, c } = tips[i], e = k * k * (3 - 2 * k)
      const x0 = r.x * w, y0 = r.y * h, x1 = c.x * w, y1 = c.y * h, mx = (x0 + x1) / 2, my = Math.min(y0, y1) - h * .12
      const bx = (1 - e) ** 2 * x0 + 2 * (1 - e) * e * mx + e * e * x1, by = (1 - e) ** 2 * y0 + 2 * (1 - e) * e * my + e * e * y1
      ctx.strokeStyle = 'rgba(240,236,226,.07)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke()
      ctx.fillStyle = 'rgba(233,200,130,.95)'; ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, 7); ctx.fill()
    }
    for (const c of clusters) {
      c.heat = Math.max((c.heat || 0) * .985, .2)
      const R = 10 + c.heat * 14
      const g = ctx.createRadialGradient(c.x * w, c.y * h, 0, c.x * w, c.y * h, R * 3)
      g.addColorStop(0, `rgba(233,200,130,${.5 * c.heat})`); g.addColorStop(1, 'rgba(233,200,130,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x * w, c.y * h, R * 3, 0, 7); ctx.fill()
      ctx.strokeStyle = 'rgba(240,236,226,.6)'; ctx.beginPath(); ctx.arc(c.x * w, c.y * h, R, 0, 7); ctx.stroke()
    }
  }
}
function Signals() {
  const ref = useRef(null)
  useLoop(ref, setupSignals)
  return <div className="sg">
    <canvas ref={ref} aria-hidden="true" />
    <span className="sg-cap sg-l">Tips from everywhere</span>
    <span className="sg-cap sg-r">Your newsroom’s desk</span>
  </div>
}

// Spacial: scattered records drift in and settle into one mark, then loosen and gather again.
function setupAssemble(ctx) {
  const rnd = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(11)
  const dots = SP_DOTS.map(([x, y]) => ({ x, y, sx: rnd(), sy: rnd() }))
  const extra = Array.from({ length: 60 }, () => ({ x: rnd(), y: rnd(), p: rnd() * 6 }))
  return (w, h, t) => {
    ctx.clearRect(0, 0, w, h)
    const cyc = (t % 9) / 9, k = cyc < .15 ? 0 : cyc < .55 ? (cyc - .15) / .4 : cyc < .85 ? 1 : 1 - (cyc - .85) / .15
    const e = k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    for (const d of extra) { ctx.fillStyle = `rgba(169,150,255,${(.12 + .1 * Math.sin(t + d.p)) * (1 - e * .7)})`; ctx.beginPath(); ctx.arc(d.x * w, d.y * h, 2, 0, 7); ctx.fill() }
    const s = Math.min(w, h) / 120, ox = w / 2 - 40 * s, oy = h / 2 - 45 * s
    dots.forEach((d, i) => {
      const x = (1 - e) * d.sx * w + e * (ox + d.x * s), y = (1 - e) * d.sy * h + e * (oy + d.y * s)
      ctx.fillStyle = i % 5 === 0 ? '#c04f72' : '#a996ff'
      ctx.beginPath(); ctx.arc(x, y, 3 + e * (5.2 * s - 3), 0, 7); ctx.fill()
    })
  }
}
function Assemble() {
  const ref = useRef(null)
  useLoop(ref, setupAssemble)
  return <div className="sg sg-short"><canvas ref={ref} aria-hidden="true" /><span className="sg-cap sg-l">Scattered records</span><span className="sg-cap sg-r">One clinical story</span></div>
}

const visuals = { climb: Climb, signals: Signals, assemble: Assemble }

export default function Company({ slug }) {
  const c = companies.find(x => x.slug === slug)
  useEffect(() => { if (c) document.title = `${c.name} | SparkTech Studio` }, [c])
  useEffect(() => { if (window.location.hash === '') window.scrollTo(0, 0) }, [slug])
  if (!c) return <main className="co-page co-missing"><a href="/">Back</a></main>
  const Visual = visuals[c.visual]
  const st = studies[c.slug]
  const bgStyle = c.bg ? { backgroundImage: `url(${c.bg})` } : { background: c.bgCss }
  return <div className={`co-page co-${c.slug}`} style={c.theme}>
    <header className="co-nav">
      <a className="co-back" href="/work"><span>←</span><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</a>
      {c.url ? <a className="btn btn-ghost co-visit" href={c.url} target="_blank" rel="noreferrer">Visit {c.host}</a> : <span className="co-host">{c.host}</span>}
    </header>
    <main id="main">
    <section className="co-hero">
      <div className="co-bg" style={bgStyle} />
      {c.bgMobile && <style>{`@media (max-width:860px){.co-${c.slug} .co-bg{background-image:url(${c.bgMobile})!important}}`}</style>}
      <div className={`co-figure ${c.figureClass || ''}`}>
        {c.figure === 'spacial-mark' ? <SpacialMark /> : <img src={c.figure} alt={c.figureAlt} />}
      </div>
      <div className="co-copy">
        <p className="co-kicker">{c.kicker}</p>
        <h1>{c.name}</h1>
        <p className="co-value">{c.value}</p>
        <p className="co-line">{c.lede}</p>
      </div>
    </section>
    {st && <section className="co-section co-study" aria-labelledby="study-title">
      <p className="co-label">Case study</p>
      <h2 id="study-title">{c.name}, <em>start to live.</em></h2>
      <dl className="co-facts">
        <div><dt>The problem</dt><dd>{st.problem}</dd></div>
        <div><dt>What we built</dt><dd><ul>{st.built.map(b => <li key={b}>{b}</li>)}</ul></dd></div>
        <div><dt>Built with</dt><dd>{st.stack}</dd></div>
        <div><dt>Where it stands</dt><dd>{st.status}</dd></div>
        <div><dt>Results</dt><dd>{st.results || <aside className="co-todo" role="note"><strong>TODO</strong> No verified results yet. Add real numbers or a quote, with permission, before promoting this case study.</aside>}</dd></div>
      </dl>
    </section>}
    {c.visionTitle && <section className="co-section">
      <p className="co-label">The vision</p>
      <h2>{c.visionTitle}</h2>
      {Visual && <div className="co-visual"><Visual c={c} /></div>}
      {c.note && <p className="co-note">{c.note}</p>}
    </section>}
    {c.how && <section className="co-section co-how" aria-labelledby="how-title">
      <p className="co-label">How it works</p>
      <h2 id="how-title">{c.howTitle}</h2>
      <ol className="co-steps">
        {c.how.map(([name, copy]) => <li key={name}><h3>{name}</h3><p>{copy}</p></li>)}
      </ol>
      {c.howNote && <p className="co-note">{c.howNote}</p>}
    </section>}
    <section className="co-ask">
      <p>Want something built like this?</p>
      <a className="btn" href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a>
    </section>
    </main>
    <nav className="co-others" aria-label="More work">
      {workSlugs.filter(s => s !== slug).map(s => companies.find(x => x.slug === s)).map(x => <a key={x.slug} href={`/work/${x.slug}`}><strong>{x.name}</strong><span>{x.line}</span></a>)}
    </nav>
    <footer className="co-foot"><span className="co-foot-links"><a className="btn" href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a><a href={`mailto:${EMAIL}`}>Email us</a></span><span>© {year} SparkTech Studios, Inc. · <a href="/privacy">Privacy</a></span></footer>
  </div>
}
