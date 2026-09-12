import { useEffect, useRef, useState } from 'react'
import './Sisyphus.css'

const SLOGAN = 'Is the way you’re doing it the best way to do it?'

// Scene timeline in seconds. The whole loop is LOOP seconds long.
const T = { push: 4.4, look: 5.6, rush: 7.0, land: 7.55, rest: 9.4, hold: 12.0 }
const LOOP = 12.6
const R = 34                       // boulder radius before scaling
const S = 1.55                     // figure and boulder scale
const RS = R * S                   // rolling radius in scene units
const FEET = -80                   // pivot for the fall, relative to the boulder centre
const START = 230, PAUSE = 700, TOP = 870
const END_MAN = 440, END_ROCK = 475, END_ROCK2 = 70

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, k) => a + (b - a) * k
const easeOut = k => 1 - (1 - k) ** 3
const easeIn = k => k * k
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1)
const deg = rad => (rad * 180) / Math.PI

// Returns the pose of every moving part for time t.
function pose(t) {
  const p = { t, x: START, bob: 0, legs: 0, moving: false, head: 0, fall: 0, rock2: null, dust: 0, dustAt: 0, fade: 1, mood: 'strain' }
  if (t < T.push) {
    p.x = lerp(START, PAUSE, easeOut(t / T.push) * 0.55 + (t / T.push) * 0.45)
    p.moving = true; p.legs = t / 0.5; p.bob = Math.sin(t * Math.PI * 2 / 0.5) * 2
  } else if (t < T.look) {
    p.x = PAUSE; p.mood = t > T.push + 0.3 ? 'excited' : 'strain'
    p.head = -42 * easeOut(span(t, T.push + 0.1, T.push + 0.5))
    p.bob = Math.sin(t * Math.PI * 2 / 0.9) * 1.5 - 7 * Math.sin(Math.PI * span(t, T.look - 0.35, T.look)) // pant, then a hop
  } else if (t < T.land) {
    const k = span(t, T.look, T.rush)
    p.x = lerp(PAUSE, TOP, k)
    p.mood = 'excited'; p.moving = t < T.rush; p.legs = t / 0.34; p.bob = Math.sin(t * Math.PI * 2 / 0.34) * 3
    p.head = -42 * (1 - easeOut(span(t, T.look, T.look + 0.4)))
  } else {
    const k = easeOut(span(t, T.land, T.rest))
    p.x = lerp(TOP, END_MAN, k)
    p.fall = easeOut(span(t, T.land, T.land + 0.5)); p.mood = 'hit'
    p.rockX = lerp(TOP, END_ROCK, k)
    p.dust = 1 - span(t, T.land, T.land + 0.9); p.dustAt = TOP
    if (t > T.hold) p.fade = 1 - span(t, T.hold, LOOP)
  }
  if (p.rockX === undefined) p.rockX = p.x
  // Second boulder: falls from the peak, bounces once, and lands on him.
  const t0 = T.rush - 0.35
  if (t >= t0) {
    const a = span(t, t0, t0 + 0.42), b = span(t, t0 + 0.42, T.land), c = span(t, T.land, T.rest)
    if (t < t0 + 0.42) p.rock2 = { x: lerp(1000, 950, a), y: -RS - 300 * (1 - easeIn(a)) }
    else if (t < T.land) p.rock2 = { x: lerp(950, TOP - 90, b), y: -RS - 150 * Math.sin(Math.PI * b) }
    else p.rock2 = { x: lerp(TOP - 90, END_ROCK2, easeOut(c)), y: -RS }
  }
  return p
}

function Head({ p }) {
  const excited = p.mood === 'excited', hit = p.mood === 'hit'
  const grunt = p.moving ? Math.max(0, Math.sin(p.legs * Math.PI * 2)) : 0
  const sweat = p.moving ? [(p.legs % 1), ((p.legs + 0.5) % 1)] : []
  return <g transform={`translate(${p.sh[0]} ${p.sh[1]}) rotate(${p.head}) translate(11 -19) scale(1.3)`}>
    <circle r={12} className="sis-skin" />
    <path d="M-13 -1 Q-14 -12 -5 -14 Q2 -16 7 -11 Q1 -11 -3 -7 Q-8 -3 -13 -1 Z" className="sis-hair" />
    <path d="M1 9 Q5 13 12 5 Q11 11 6 13 Q1 14 -3 11 Z" className="sis-hair" />
    {hit
      ? <g className="sis-thin"><path transform="rotate(22 4 -2)" d="M1 -5 l6 6 M7 -5 l-6 6" /><path d="M1 8 q2 -2 4 0 q2 2 4 0" /></g>
      : excited
        ? <g><circle cx={5} cy={-2} r={2.6} className="sis-eye" /><circle cx={5.8} cy={-2.3} r={1} className="sis-pupil" />
            <path d="M0 -8 q4 -3 8 -2" className="sis-thin" /><path d="M2 5 q4 6 9 1 q-3 2 -9 -1 Z" className="sis-mouth" /></g>
        : <g><circle cx={5} cy={-2} r={1.4} className="sis-pupil" /><path d="M1 -6 l7 1.5" className="sis-thin" /><path d="M3 6 l7 -1" className="sis-thin" /></g>}
    {grunt > 0.2 && <g className="sis-thin" style={{ opacity: grunt }}>
      <path d="M15 4 l7 -2 M15 8 l8 1 M14 12 l6 4" /></g>}
    {sweat.map((k, i) => <path key={i} className="sis-drop" style={{ opacity: 1 - k }}
      d={`M${-10 - k * 14 + i * 4} ${-6 - k * 16} q-2 4 0 6 q3 -2 0 -6 Z`} />)}
    {excited && <g className="sis-thin"><path d="M14 -18 l3 -7 M20 -14 l6 -5 M9 -22 l-1 -7" /></g>}
    {hit && [0, 1, 2].map(i => {
      const a = p.t * 3 + i * 2.1, r = 22
      return <path key={i} className="sis-star" transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r * 0.5 - 12})`} d="M0 -4 L1.2 -1.2 4 0 1.2 1.2 0 4 -1.2 1.2 -4 0 -1.2 -1.2 Z" />
    })}
  </g>
}

function Figure({ p }) {
  const legs = p.moving ? p.legs * Math.PI * 2 : 0
  const s = Math.sin(legs), lift = Math.max(0, s) * 7, lift2 = Math.max(0, -s) * 7
  const hip = [-66, -48 + p.bob], sh = [-40, -84 + p.bob]
  const f1 = [-82 + 14 * s, -lift], f2 = [-82 - 14 * s, -lift2]
  const knee = f => [(hip[0] + f[0]) / 2 - 9, (hip[1] + f[1]) / 2 + 4]
  const fallDeg = -112 * p.fall
  const b = p.bob
  return <g transform={`translate(${p.x} 0) scale(${S}) rotate(${fallDeg} ${FEET} 0)`}>
    <g className="sis-limb">
      <polyline points={`${f2} ${knee(f2)} ${hip}`} />
      <ellipse cx={f2[0] - 2} cy={f2[1] - 1} rx={6} ry={3} className="sis-foot" />
    </g>
    <path className="sis-tunic" d={`M-52 ${-88 + b} L-28 ${-80 + b} L-46 ${-38 + b} L-80 ${-46 + b} Z`} />
    <path className="sis-thin" d={`M-72 ${-58 + b} L-46 ${-52 + b}`} />
    <g className="sis-limb">
      <polyline points={`${f1} ${knee(f1)} ${hip}`} />
      <ellipse cx={f1[0] - 2} cy={f1[1] - 1} rx={6} ry={3} className="sis-foot" />
      <polyline points={`${sh} -50,${-58 + b} -31,${-22 + b}`} />
      <circle cx={-31} cy={-21 + b} r={4.5} className="sis-hand" />
      <line x1={sh[0]} y1={sh[1]} x2={-33} y2={-44 + b} />
      <circle cx={-33} cy={-43 + b} r={4.5} className="sis-hand" />
    </g>
    <Head p={{ ...p, sh }} />
  </g>
}

function Rock({ x, y = -RS, spin }) {
  return <g transform={`translate(${x} ${y}) scale(${S}) rotate(${spin})`} className="sis-rock">
    <circle r={R} />
    <path d="M-16 6 L-6 -10 L12 -6 M-6 -10 L-2 -22 M10 14 L20 10 M-24 -8 L-20 -16" className="sis-thin" />
    <circle cx={14} cy={8} r={3.5} className="sis-pit" /><circle cx={-18} cy={12} r={2.5} className="sis-pit" /><circle cx={4} cy={-24} r={2} className="sis-pit" />
  </g>
}

function Cloud({ x, y, k }) {
  const c = [[-34, 0, 16], [-8, -14, 22], [22, -4, 17], [42, 6, 12]]
  return <g transform={`translate(${x} ${y}) scale(${k})`} className="sis-cloud">
    <g className="sis-cloud-line">{c.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}<rect x={-50} y={4} width={104} height={14} /></g>
    <g className="sis-cloud-fill">{c.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}<rect x={-50} y={4} width={104} height={14} /></g>
    <line x1={-50} y1={18} x2={54} y2={18} className="sis-cloud-line" />
  </g>
}

function Puff({ x, y, k, opacity }) {
  return <g transform={`translate(${x} ${y}) scale(${0.5 + k})`} className="sis-puff" style={{ opacity }}>
    <circle cx={-10} cy={3} r={9} /><circle cx={2} cy={-4} r={11} /><circle cx={13} cy={4} r={8} />
  </g>
}

function Scene({ p }) {
  const dust = p.dust > 0 ? [[-40, -8], [36, -26], [-18, -44], [52, -6], [8, -60], [-60, -30]] : null
  const burst = p.t >= T.land && p.t < T.land + 0.4 ? span(p.t, T.land, T.land + 0.4) : 0
  return <svg className="sis-svg" viewBox="0 0 1200 580" aria-hidden="true" style={{ opacity: p.fade }}>
    <g className="sis-sky">
      <circle cx={1040} cy={90} r={34} className="sis-sun" />
      <Cloud x={190} y={120} k={1} /><Cloud x={640} y={62} k={0.7} />
    </g>
    <g transform="rotate(-20 600 380)">
      <path className="sis-mountain" d="M60 380 H1000 L1150 520 L1500 850 L1500 1100 L-300 1100 Z" />
      <path className="sis-ground" d="M60 380 H1000 L1150 520" />
      <g className="sis-thin sis-contour"><path d="M300 420 q60 -6 120 8 M700 430 q40 -10 90 2 M520 470 q50 -8 100 6" /></g>
      <g className="sis-pebbles"><path d="M330 380 q10 -14 22 0 Z M610 380 q8 -10 18 0 Z M840 380 q9 -12 20 0 Z M1080 455 q8 -10 18 2 Z" /></g>
      <g className="sis-flag"><line x1={1000} y1={380} x2={1000} y2={322} /><path d="M1000 322 L1034 333 L1000 344 Z" /></g>
      <g className="sis-ink" transform="translate(0 380)">
        <Figure p={p} />
        <Rock x={p.rockX} spin={deg((p.rockX - START) / RS)} />
        {p.rock2 && <Rock x={p.rock2.x} y={p.rock2.y} spin={deg((p.rock2.x - 1000) / RS)} />}
        {burst > 0 && <path className="sis-burst" style={{ opacity: 1 - burst }} transform={`translate(${TOP - 80} -70) scale(${0.6 + burst * 1.4})`}
          d="M0 -30 L8 -10 L30 -12 L12 2 L22 24 L2 12 L-16 28 L-12 6 L-32 -2 L-10 -8 Z" />}
        {dust && dust.map(([dx, dy], i) => <Puff key={i} opacity={p.dust * 0.9} k={1 - p.dust}
          x={p.dustAt - 70 + dx * (1.8 - p.dust)} y={-30 + dy * (1.8 - p.dust)} />)}
      </g>
    </g>
  </svg>
}

const VIDEO = '/sisyphus.mp4'
const POSTER = '/sisyphus-poster.jpg'
const VIDEO_FALL = 9.6   // seconds into the video where the boulder hits and the slogan can appear

export default function Sisyphus() {
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [useDrawing, setUseDrawing] = useState(false)
  const [t, setT] = useState(reduced ? 2.2 : 0)
  const [revealed, setRevealed] = useState(reduced)
  const host = useRef(null)
  const video = useRef(null)

  // Play the rendered video only while the section is in view.
  useEffect(() => {
    if (reduced || useDrawing) return
    const el = video.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => setUseDrawing(true))
      else el.pause()
    }, { threshold: 0.25 })
    io.observe(host.current)
    return () => io.disconnect()
  }, [reduced, useDrawing])

  // Drawn fallback: reduced motion shows a still, a failed video runs the drawn loop.
  useEffect(() => {
    if (reduced || !useDrawing) return
    let raf = 0, start = 0, active = false, last = 0
    const tick = now => {
      if (!start) start = now - last
      const local = ((now - start) / 1000) % LOOP
      last = now - start
      if (local >= T.rest) setRevealed(true)
      setT(local)
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !active) { active = true; start = 0; raf = requestAnimationFrame(tick) }
      else if (!e.isIntersecting && active) { active = false; cancelAnimationFrame(raf) }
    }, { threshold: 0.25 })
    io.observe(host.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [reduced, useDrawing])

  const p = pose(t)
  if (reduced) { p.moving = false; p.bob = 0 }
  const showVideo = !reduced && !useDrawing
  return <section className="sis" id="question" aria-labelledby="sis-title" ref={host}>
    <div className="wrap">
      {showVideo
        ? <video ref={video} className="sis-video" src={VIDEO} poster={POSTER} muted loop playsInline preload="metadata" aria-hidden="true"
            onTimeUpdate={e => { if (e.currentTarget.currentTime >= VIDEO_FALL) setRevealed(true) }}
            onError={() => setUseDrawing(true)} />
        : <Scene p={p} />}
      <h2 id="sis-title" className={revealed ? 'sis-title is-in' : 'sis-title'}>{SLOGAN}</h2>
    </div>
  </section>
}
