import { useRef } from 'react'
import { useLoop } from './useLoop'
import { built, systems, EMAIL, year } from './content.jsx'
import './Contour.css'

// A topographic map of terrain that keeps moving: marching squares over drifting 3D noise, one contour in gold, a lift under the pointer.
const perm = Uint8Array.from({ length: 512 }, (_, i) => [...Array(256).keys()].sort((a, b) => Math.sin(a * 91.7) - Math.sin(b * 91.7))[i & 255])
const fade = t => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a, b, t) => a + (b - a) * t
const grad = (h, x, y, z) => { const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v) }
function noise(x, y, z) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z)
  const u = fade(x), v = fade(y), w = fade(z)
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z
  return lerp(lerp(lerp(grad(perm[AA] & 15, x, y, z), grad(perm[BA] & 15, x - 1, y, z), u), lerp(grad(perm[AB] & 15, x, y - 1, z), grad(perm[BB] & 15, x - 1, y - 1, z), u), v),
    lerp(lerp(grad(perm[AA + 1] & 15, x, y, z - 1), grad(perm[BA + 1] & 15, x - 1, y, z - 1), u), lerp(grad(perm[AB + 1] & 15, x, y - 1, z - 1), grad(perm[BB + 1] & 15, x - 1, y - 1, z - 1), u), v), w)
}

const LEVELS = 16
function setup2d(ctx) {
  let field = new Float32Array(0)
  return (w, h, t, ptr) => {
    const cell = w < 700 ? 9 : 11
    const cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1
    if (field.length !== cols * rows) field = new Float32Array(cols * rows)
    const z = t * 0.045, px = ptr.x * w, py = ptr.y * h
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * cell, y = j * cell, nx = x / 420, ny = y / 420
      const d = Math.hypot(x - px, y - py)
      field[j * cols + i] = noise(nx, ny, z) * 0.75 + noise(nx * 2.3, ny * 2.3, z * 1.6) * 0.25 + Math.exp(-(d * d) / 52000) * 0.35
    }
    ctx.clearRect(0, 0, w, h)
    ctx.lineWidth = 0.75
    for (let l = 0; l < LEVELS; l++) {
      const iso = -0.55 + (l / (LEVELS - 1)) * 1.2
      const gold = l === 10
      ctx.strokeStyle = gold ? 'rgba(184,134,11,.95)' : `rgba(18,18,22,${l % 4 === 0 ? 0.42 : 0.18})`
      ctx.lineWidth = gold ? 1.4 : l % 4 === 0 ? 0.9 : 0.6
      ctx.beginPath()
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const a = field[j * cols + i], b = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i]
        const idx = (a > iso) | ((b > iso) << 1) | ((c > iso) << 2) | ((d > iso) << 3)
        if (idx === 0 || idx === 15) continue
        const x = i * cell, y = j * cell
        const top = [x + cell * (iso - a) / (b - a), y], right = [x + cell, y + cell * (iso - b) / (c - b)]
        const bottom = [x + cell * (iso - d) / (c - d), y + cell], left = [x, y + cell * (iso - a) / (d - a)]
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]) }
        switch (idx) {
          case 1: case 14: seg(left, top); break
          case 2: case 13: seg(top, right); break
          case 3: case 12: seg(left, right); break
          case 4: case 11: seg(right, bottom); break
          case 6: case 9: seg(top, bottom); break
          case 7: case 8: seg(left, bottom); break
          case 5: seg(left, top); seg(right, bottom); break
          case 10: seg(top, right); seg(left, bottom); break
        }
      }
      ctx.stroke()
    }
  }
}

export default function Contour() {
  const ref = useRef(null)
  const setup = setup2d
  useLoop(ref, setup)
  return <div className="ct">
    <canvas ref={ref} className="ct-canvas" aria-hidden="true" />
    <header className="ct-nav">
      <a href="/designs/3" className="ct-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</a>
      <span className="ct-coord">40.7128° N · 74.0060° W</span>
      <nav className="ct-links"><a href="#systems">Systems</a><a href="#contact">Contact</a></nav>
    </header>
    <main className="ct-main">
      <h1>We create<br />the future.</h1>
      <div className="ct-side">
      <section className="ct-sys" id="systems" aria-labelledby="sys-title">
        <h2 id="sys-title">The systems</h2>
        <p className="ct-sys-title">{systems.title}</p>
        <p className="ct-sys-lead">{systems.lead}</p>
        <ol>{systems.steps.map(k => <li key={k}>{k}</li>)}</ol>
        <p className="ct-sys-proof">{systems.status}</p>
      </section>
      <section className="ct-legend" aria-labelledby="legend-title">
        <h2 id="legend-title">Legend · What we’ve built</h2>
        <ul>
          {built.map(b => <li key={b.name}>
            <a href={b.url}>
              <i aria-hidden="true" />
              <strong>{b.name}</strong>
              <span>{b.line}</span>
              <code>{b.host}</code>
            </a>
          </li>)}
        </ul>
      </section>
      </div>
    </main>
    <footer className="ct-foot" id="contact">
      <a className="ct-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      <span>© {year} SparkTech Studios, Inc.</span>
    </footer>
  </div>
}
