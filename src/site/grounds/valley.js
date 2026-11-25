// The page ground (2026-11-25, Spencer's pick): a landscape drawn only in fine gold lines that you fly through as the
// page scrolls, from high mountains at the top of a page to open sea at the bottom.
//
// The world: x is across, z is ahead, height is up. Ridgelines are cuts across the land at fixed distances z, drawn far to
// near; each fills below itself with the page black before it is stroked, so nearer land truly hides what is behind it.
// The geography is laid out along the flight relative to the page's length: mountains in a narrow valley, lower hills and
// a wider floor, a flat delta, then the sea. All water (river, delta channels, sea) is drawn the way engravers draw it:
// fine, broken, staggered horizontal ripple strokes, dimmer than the land, placed at fixed spots in the world and drawn
// between the ridges either side of them so the land hides them properly. On the river, sun glitter is short, bright
// horizontal ticks down a loose, wandering path; it thins out through the hills and is gone by the delta, so the sea under
// the end of a page is ripples only. The shore is the land's own irregular edge. Motion comes only from scrolling: the
// camera follows the scroll position on a critically damped spring and the frame loop stops once it has settled. The
// terrain is seeded, the same on every visit. Canvas 2D, no dependencies.
import { frames, listen, fit, seeded } from './shared.js'

const SEED = 20261125
const FLY = 0.0016 // world units flown per CSS px scrolled (the home page is a flight of about 14 units)
const MIN_FLIGHT = 10 // short pages fly faster, so every page still runs from the mountains to the sea
const CAM = 1.25 // camera height above the water (lower on phones, so the mountains rise higher on a tall screen)
const OMEGA = 24 // camera spring: settles within about a quarter of a second of the scroll stopping
const GOLD = '255, 209, 92'
const STEP = 4 // CSS px between samples along a ridgeline
const RIP = 0.006 // world units between possible ripple lines on the water (kept about 3 px apart on screen)
const BG = '#0a0a09'

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const mix = (a, b, t) => a + (b - a) * t
// A stable 0 to 1 hash of two integers, for things placed at fixed spots in the world (ripples, glitter)
const hash = (a, b) => {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x7f4a7c15) | 0, 0xc2b2ae35)
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

// Seeded Perlin noise, roughly -0.6 to 0.6
function perlin(seed) {
  const rnd = seeded(seed), perm = new Uint8Array(512), base = [...Array(256).keys()]
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [base[i], base[j]] = [base[j], base[i]] }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255]
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10)
  const grad = (h, x, y) => { const a = h & 7, u = a < 4 ? x : y, v = a < 4 ? y : x; return ((a & 1) ? -u : u) + ((a & 2) ? -2 * v : 2 * v) }
  return (x, y) => {
    const X = Math.floor(x), Y = Math.floor(y), xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255
    const u = fade(xf), v = fade(yf)
    const aa = perm[perm[xi] + yi], ab = perm[perm[xi] + yi + 1], ba = perm[perm[xi + 1] + yi], bb = perm[perm[xi + 1] + yi + 1]
    const g = grad(aa, xf, yf), x1 = g + u * (grad(ba, xf - 1, yf) - g)
    const g2 = grad(ab, xf, yf - 1), x2 = g2 + u * (grad(bb, xf - 1, yf - 1) - g2)
    return (x1 + v * (x2 - x1)) * 0.45
  }
}

const noise = perlin(SEED), noise2 = perlin(SEED + 1), noise3 = perlin(SEED + 3)
// The river's phases, chosen by eye: from the top of a page it enters at the bottom of the screen, passes under the hero
// buttons and winds left, then right, to the horizon
const P = [0.8, 1.3, 0.6]

// Where along the journey a distance z falls, and what the land is like there. u runs 0 to 1 over the page: the eye looks
// at land some way ahead of the camera (`ahead`, the middle of the lower screen), so u is measured from there and the
// land on screen matches where the reader is on the page
let ahead = 2.5
function zone(z, Z) {
  const u = (z - ahead) / Z
  const low = ss(0.3, 0.62, u) // mountains step down to hills
  const flat = ss(0.74, 0.96, u) // hills flatten into the delta
  const sea = ss(0.95, 1.01, u) // the delta sinks under the sea
  return {
    low, flat, sea,
    relief: mix(mix(1, 0.5, low), 0.035, flat), // height of the peaks
    sharp: mix(1, 0.15, low), // ridged peaks become rounded hills
    R: mix(mix(0.2, 0.32, low), 0.58, flat), // half the river's width
    floor: mix(mix(0.04, 0.35, low), 1.9, flat), // flat ground between the river and the valley wall
    wallW: mix(2.4, 3.6, low),
    wallH: mix(mix(0.85, 0.3, low), 0.05, flat),
    sink: 0.075 * flat + 1.4 * sea, // in the delta low ground goes under, leaving islands; at the coast, all of it
    meander: mix(1, 0.85, low) * (1 - 0.8 * ss(0.76, 1.1, u)), // the course straightens slowly toward the coast
    glitter: 1 - ss(0.45, 0.76, u), // sun glitter on the river thins out through the hills and is gone by the delta
  }
}

// The river's course: a long meander, a shorter one and a small wobble; broader lower down, nearly straight at sea
const course = (z, m) => m * (1.25 * Math.sin(0.17 * z + P[0]) + 0.55 * Math.sin(0.41 * z + P[1]) + 0.3 * Math.sin(1.07 * z + P[2]) + 0.09 * Math.sin(2.3 * z + 1.9))

// Level of detail: relief finer than a few pixels at this depth fades out, so far ridges never shimmer
const octW = new Float32Array(5)
let octN = 5, fineW1 = 1, fineW2 = 1
function setLod(px) { // px: screen pixels per world unit at this depth
  let f = 0.34
  octN = 0
  for (let o = 0; o < 5; o++) { octW[o] = ss(4, 11, px / f); if (octW[o] > 0) octN = o + 1; f *= 2.03 }
  fineW1 = ss(4, 11, px / 2.6); fineW2 = ss(4, 11, px / 7.1)
}

// How far the water reaches from the river's middle on one side at distance z: the shore wanders, and now and then a
// spit or sandbar pushes in from one bank
function shore(z, p, side) {
  const o = side * 17.3
  let r = p.R * (1 + 0.45 * noise3(z * 1.7 + o, 4.2 + o) + 0.18 * noise3(z * 4.3 + o, 8.9 + o) + 0.16 * noise3(z * 11 + o, 2.3 + o))
  const spit = noise3(z * 0.9 + o, 12.5 + o)
  if (spit > 0.24) r -= (spit - 0.24) * 2.2 * p.R
  return r > 0.3 * p.R ? r : 0.3 * p.R
}

// Land height above the water at (x, z); 0 or less is water. p.RL and p.RR are the shore on each side at this z
function land(x, z, p, cx) {
  const bank = x < cx ? cx - x - p.RL : x - cx - p.RR
  if (bank <= 0) return -1
  const lift = bank < 0.18 ? bank / 0.18 : 1
  const fb = bank > p.floor ? bank - p.floor : 0
  const wall = fb < p.wallW ? fb / p.wallW : 1
  let h = 0.04 * lift + p.wallH * wall * wall * (3 - 2 * wall)
  if (p.relief > 0.01) {
    const back = ss(0.25, 2.45, fb)
    if (back > 0) {
      let amp = 1, f = 0.34, m = 0
      for (let o = 0; o < octN; o++) {
        const v = noise(x * f, z * f), r = 1 - Math.abs(v), n = r + (0.5 + v - r) * (1 - p.sharp)
        m += n * n * amp * octW[o]; amp *= 0.5; f *= 2.03
      }
      h += m * 0.8 * p.relief * back
    }
  }
  h += (noise2(x * 2.6, z * 2.6) * 0.06 * (1 - 0.92 * p.flat) * fineW1 + noise2(x * 7.1 + 31, z * 7.1) * 0.018 * (1 - 0.9 * p.flat) * fineW2) * lift
  // The delta: long low islands lying with the current, between channels that open as the land sinks
  if (p.flat > 0) h += p.flat * 0.13 * noise2(x * 0.7 + 40, z * 0.28) * lift
  return h - p.sink
}

export default function mount(canvas, { reduced, ready }) {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas 2D is not available')
  let dead = false, view = null, flight = MIN_FLIGHT, scrollable = 0
  let xs, ys, H, CAMH = CAM
  const cam = { z: 0, v: 0, target: 0, last: 0 }

  const measure = () => {
    scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    flight = Math.max(MIN_FLIGHT, scrollable * FLY)
  }
  const target = () => (reduced || scrollable <= 0 ? 0 : (Math.min(scrollable, Math.max(0, window.scrollY)) / scrollable) * flight)

  // Critically damped spring toward the scroll position; true once settled
  const glide = now => {
    const dt = cam.last ? Math.min(0.064, (now - cam.last) / 1000) : 1 / 60
    cam.last = now
    const e = cam.z - cam.target, c = cam.v + OMEGA * e, ex = Math.exp(-OMEGA * dt)
    cam.z = cam.target + (e + c * dt) * ex
    cam.v = (cam.v - OMEGA * c * dt) * ex
    if (Math.abs(cam.z - cam.target) < 2e-4 && Math.abs(cam.v) < 2e-3) { cam.z = cam.target; cam.v = 0; cam.last = 0; return true }
    return false
  }

  const render = () => {
    const { w, h, ratio, phone } = view
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, w, h)
    const Z = flight, zc = cam.z
    // Phones: a higher horizon, a lower camera and a narrower view across, so the mountains fill a tall screen and the
    // river has land on both sides
    const horizon = h * (phone ? 0.3 : 0.5)
    CAMH = phone ? 0.95 : CAM
    const LAT = phone ? 1.55 : 1 // world units across per unit of the vertical scale
    const focal = phone ? Math.max(h * 0.62, w * 1.2) : Math.max(w * 0.78, h * 1.15)
    const D = phone ? 7 : 8.5 // rows are spaced for full detail out to this depth, then thin out toward the horizon
    const bottom = (focal * CAMH) / (h - horizon) // where the water meets the bottom of the screen
    const near = bottom * 0.6, far = D * 1.45
    const gap = (D - near) / (phone ? 96 : 150)
    ahead = bottom * 0.8
    // Every fourth row runs to the horizon; the others fade out with depth, so the distance never turns into a moiré
    const thinOf = (k, dz) => (k % 4 === 0 ? 1 : k % 2 === 0 ? 1 - ss(0.72 * D, 1.05 * D, dz) : 1 - ss(0.5 * D, 0.78 * D, dz))
    const fadeOf = dz => { const t = (dz - near) / (far - near); return t >= 1 ? 0 : Math.pow(1 - t, 1.2) * Math.min(1, (1 - t) / 0.16) }
    const n = xs.length
    const rows = []
    for (let k = Math.floor((zc + far) / gap); k >= Math.ceil((zc + near) / gap); k--) {
      const z = k * gap, dz = z - zc, thin = thinOf(k, dz)
      if (dz > 0.05 && thin > 0) {
        const p = zone(z, Z)
        p.RL = shore(z, p, 0); p.RR = shore(z, p, 1)
        rows.push({ k, z, dz, thin, p, cx: course(z, p.meander) })
      }
    }
    // The camera follows the river's course, averaged a little ahead, so it drifts gently instead of swinging
    // (looking about as far ahead as the bottom of the screen, so the river enters there on every screen size)
    const pc = zone(zc + bottom, Z)
    const xc = (course(zc + 0.8 * bottom, pc.meander) + course(zc + 1.1 * bottom, pc.meander) + course(zc + 1.5 * bottom, pc.meander)) / 3
    const X = (x, s) => w / 2 + ((x - xc) * s) / LAT // world x to screen x at a depth whose scale is s
    const xAt = (sx, s) => xc + ((sx - w / 2) * LAT) / s // and back
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    for (let r = 0; r < rows.length; r++) {
      const { z, dz, thin, p, cx } = rows[r]
      const t = (dz - near) / (far - near) // 0 nearest, 1 at the horizon
      const s = focal / dz
      setLod(s / LAT)
      for (let i = 0; i < n; i++) {
        const hl = land(xAt(xs[i], s), z, p, cx)
        H[i] = hl
        ys[i] = horizon + s * (CAMH - (hl > 0 ? hl : 0))
      }
      // Hide what is behind: fill below this ridge with the page black
      ctx.beginPath()
      ctx.moveTo(xs[0], ys[0])
      for (let i = 1; i < n; i++) ctx.lineTo(xs[i], ys[i])
      ctx.lineTo(xs[n - 1], h + 4)
      ctx.lineTo(xs[0], h + 4)
      ctx.closePath()
      ctx.fillStyle = BG
      ctx.fill()

      const fade = fadeOf(dz), a = fade * thin, near2 = (1 - t) * (1 - t)

      // The land: only where it stands above the water, so the water is never crossed by a ridge
      if (a > 0.008) {
        ctx.beginPath()
        let on = false
        for (let i = 0; i < n; i++) {
          const up = H[i] > 0
          if (up && !on) {
            if (i > 0) {
              const f = -H[i - 1] / (H[i] - H[i - 1])
              ctx.moveTo(xs[i - 1] + f * STEP, ys[i - 1] + f * (ys[i] - ys[i - 1]))
              ctx.lineTo(xs[i], ys[i])
            } else ctx.moveTo(xs[i], ys[i])
            on = true
          } else if (up) ctx.lineTo(xs[i], ys[i])
          else if (on) {
            const f = H[i - 1] / (H[i - 1] - H[i])
            ctx.lineTo(xs[i - 1] + f * STEP, ys[i - 1] + f * (ys[i] - ys[i - 1]))
            on = false
          }
        }
        ctx.lineWidth = 0.5 + 0.75 * near2
        ctx.strokeStyle = `rgba(${GOLD}, ${0.5 * a})`
        ctx.stroke()
      }

      // The water between this ridge and the next nearer one, drawn now so the nearer land hides it where it should:
      // ripple lines on a fixed grid in the world, each broken into staggered pieces with soft ends
      const nr = rows[r + 1]
      if (!nr) continue
      const zn = nr.z, pn = nr.p, L = z - zn
      const wide = p.flat > 0.02 || p.sea > 0.001 // past the hills there is open water beside the river too
      const cell = mix(0.085, 0.42, p.sea), dense = mix(0.8, 0.42, p.sea)
      const base = mix(0.58, 0.26, p.sea)
      const water = x => { // is world x water? (beside the river, judged from this ridge)
        const i = Math.round((X(x, s) + STEP) / STEP)
        return i >= 0 && i < n ? H[i] <= 0 : false
      }
      const p1 = new Path2D(), p2 = new Path2D(), p4 = new Path2D(), glint = new Path2D()
      let any = false
      for (let q = Math.floor(z / RIP); q > zn / RIP; q--) {
        const zq = (q + 0.3 * (hash(q, 5) - 0.5)) * RIP
        if (zq > z || zq <= zn) continue
        const dq = zq - zc
        if (dq <= 0.05) continue
        const sq = focal / dq
        // Keep ripple lines about 3 px apart on screen at any distance: the rest are dropped (softly, never popping)
        const keep = (sq * CAMH * RIP) / dq / 3.2, hk = hash(q, 3)
        if (hk >= keep) continue
        const fq = fadeOf(dq) * base
        if (fq < 0.006) continue
        const soft = Math.min(1, (keep - hk) / 0.25) > 0.5
        const f = (z - zq) / L
        const cq = mix(cx, nr.cx, f), lq = mix(p.RL, pn.RL, f), rq = mix(p.RR, pn.RR, f)
        const yq = horizon + sq * CAMH
        const x0 = wide ? xAt(-STEP, sq) : cq - lq, x1 = wide ? xAt(w + STEP, sq) : cq + rq
        const core = soft ? p1 : p2, tip = soft ? p2 : p4
        const emit = (A, B) => {
          const xa = X(A, sq), xb = X(B, sq)
          if (xb < -2 || xa > w + 2 || xb - xa < 0.8) return
          const tp = 0.22 * (xb - xa)
          tip.moveTo(xa, yq); tip.lineTo(xa + tp, yq); tip.moveTo(xb - tp, yq); tip.lineTo(xb, yq)
          core.moveTo(xa + tp, yq); core.lineTo(xb - tp, yq)
          any = true
        }
        for (let c = Math.floor(x0 / cell); c <= Math.floor(x1 / cell); c++) {
          if (hash(c * 31 + 7, q) > dense) continue
          const A = (c + hash(c, q * 3 + 1)) * cell
          const B = A + cell * (0.45 + 1.3 * hash(c, q * 3 + 2))
          if (!wide) { const a2 = Math.max(A, cq - lq), b2 = Math.min(B, cq + rq); if (b2 > a2) emit(a2, b2); continue }
          // Open water: clip the piece to the water, walking across it a few pixels at a time
          const stepW = (3 * LAT) / sq
          let start = null
          for (let x = A; x <= B; x += stepW) {
            const wet = (x > cq - lq && x < cq + rq) || water(x)
            if (wet && start === null) start = x
            else if (!wet && start !== null) { emit(start, x); start = null }
          }
          if (start !== null) emit(start, B)
        }
        // Sun glitter: now and then a short bright tick on a loose path down the river's middle
        const g = p.glitter
        if (g > 0.01 && q % 5 === 0 && hash(q, 91) < 0.12 * g) {
          const wander = Math.max(-1, Math.min(1, noise3(zq * 0.3, 2.7) * 2.2))
          const xg = cq + mix(-lq, rq, 0.5 + 0.22 * wander + 0.5 * (hash(q, 92) - 0.5))
          const hw = (0.008 + 0.034 * hash(q, 93) * hash(q, 94)) * (lq + rq) / 0.4
          const xa = X(xg - hw, sq), xb = X(xg + hw, sq)
          if (xb > 0 && xa < w) { glint.moveTo(xa, yq); glint.lineTo(xb, yq); any = true }
        }
      }
      // The shore: a faint line along the land's own wandering edge, only where the bank is land (not in open water)
      if (!wide || p.flat < 0.5) {
        const sa = fadeOf(dz) * 0.3 * (1 - p.flat)
        if (sa > 0.006) {
          ctx.beginPath()
          const ya = horizon + s * CAMH, yb = horizon + (focal / nr.dz) * CAMH, sb = focal / nr.dz
          ctx.moveTo(X(cx - p.RL, s), ya); ctx.lineTo(X(nr.cx - pn.RL, sb), yb)
          ctx.moveTo(X(cx + p.RR, s), ya); ctx.lineTo(X(nr.cx + pn.RR, sb), yb)
          ctx.lineWidth = 0.45 + 0.5 * near2
          ctx.strokeStyle = `rgba(${GOLD}, ${sa})`
          ctx.stroke()
        }
      }
      if (any) {
        const fs = fadeOf(dz) * base
        const wid = 0.45 + 0.35 * near2
        ctx.lineWidth = wid
        ctx.strokeStyle = `rgba(${GOLD}, ${fs})`; ctx.stroke(p1)
        ctx.strokeStyle = `rgba(${GOLD}, ${fs * 0.5})`; ctx.stroke(p2)
        ctx.strokeStyle = `rgba(${GOLD}, ${fs * 0.25})`; ctx.stroke(p4)
        // Glitter is the brightest gold on the page ground, crisp, never soft
        ctx.lineWidth = 0.8 + 0.5 * near2
        ctx.strokeStyle = `rgba(${GOLD}, ${Math.min(1, 1.15 * fadeOf(dz)) * p.glitter})`; ctx.stroke(glint)
      }
    }
    // Aerial haze: the page black laid over a band around the horizon, so the distance (where the headline usually sits)
    // stays quiet. It only darkens lines; there is no light, glow or colour in it
    const hz = phone ? [0.18, 0.78, 0.14, 0.22] : [0.2, 0.32, 0.05, 0.16]
    const span = (hz[0] + hz[3]) * h
    const grad = ctx.createLinearGradient(0, horizon - hz[0] * h, 0, horizon + hz[3] * h)
    grad.addColorStop(0, 'rgba(10, 10, 9, 0)')
    grad.addColorStop((hz[0] * h) / span, `rgba(10, 10, 9, ${hz[1]})`)
    grad.addColorStop(((hz[0] + hz[2]) * h) / span, `rgba(10, 10, 9, ${hz[1]})`)
    grad.addColorStop(1, 'rgba(10, 10, 9, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, horizon - hz[0] * h, w, span)
  }

  const f = frames('valley', now => {
    if (dead) return
    const settled = reduced ? true : glide(now)
    render()
    if (!settled) f.request()
  })

  const layout = () => {
    view = fit(canvas)
    const n = Math.ceil((view.w + 2 * STEP) / STEP) + 1
    xs = new Float32Array(n); ys = new Float32Array(n); H = new Float32Array(n)
    for (let i = 0; i < n; i++) xs[i] = -STEP + i * STEP
    measure()
  }
  layout()
  cam.target = cam.z = target()
  render()
  ready()

  const off = listen({
    resize: () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (w !== view.w || h !== view.h) layout(); else measure()
      cam.target = target()
      if (reduced) { cam.z = cam.target; render() } else f.request()
    },
    scroll: reduced ? null : () => { cam.target = target(); f.request() },
    grow: () => { measure(); cam.target = target(); if (reduced) render(); else f.request() },
    visible: on => { if (on) { cam.last = 0; f.request() } },
  })
  return () => { dead = true; f.cancel(); off() }
}
