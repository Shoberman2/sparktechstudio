// Helpers for the page ground (src/site/Ground.jsx, src/site/grounds/valley.js). Browser only; loaded with the valley.

// The site's phone breakpoint (site.css)
export const PHONE = '(max-width: 760px)'
export const isPhone = () => matchMedia(PHONE).matches
// Device pixels per CSS pixel: capped at 2, and at 1.5 on phones
export const pixelRatio = () => Math.min(window.devicePixelRatio || 1, isPhone() ? 1.5 : 2)

// Seeded random numbers, so a drawing is the same on every visit
export function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// One frame at a time through requestAnimationFrame, never while the tab is hidden. The time each draw takes is kept in
// window.__ground (CPU time; GPU work is not included; avgMs is over the last 60 frames, totalMs / frames over all of
// them) so it can be read from the console.
export function frames(name, draw) {
  let id = 0
  const stats = (window.__ground = { name, frames: 0, avgMs: 0, maxMs: 0, totalMs: 0 })
  const run = t => {
    id = 0
    const a = performance.now()
    draw(t)
    const ms = performance.now() - a
    stats.frames++
    stats.totalMs += ms
    stats.avgMs += (ms - stats.avgMs) / Math.min(stats.frames, 60)
    stats.maxMs = Math.max(stats.maxMs, ms)
  }
  const request = () => { if (!id && !document.hidden) id = requestAnimationFrame(run) }
  const cancel = () => { cancelAnimationFrame(id); id = 0 }
  return { request, cancel, stats }
}

// Page events for the ground: resize (debounced, also catches zoom), scroll, tab visibility and the document growing or
// shrinking (pictures loading, a FAQ opening). Returns the cleanup.
export function listen({ resize, scroll, visible, grow }) {
  let t = 0
  const onResize = () => { clearTimeout(t); t = setTimeout(resize, 150) }
  const onVis = () => visible?.(!document.hidden)
  const ro = grow && 'ResizeObserver' in window ? new ResizeObserver(() => grow()) : null
  if (resize) window.addEventListener('resize', onResize)
  if (scroll) window.addEventListener('scroll', scroll, { passive: true })
  document.addEventListener('visibilitychange', onVis)
  ro?.observe(document.body)
  return () => {
    clearTimeout(t)
    ro?.disconnect()
    window.removeEventListener('resize', onResize)
    if (scroll) window.removeEventListener('scroll', scroll)
    document.removeEventListener('visibilitychange', onVis)
  }
}

// The canvas size in CSS px and its backing store in device px
export function fit(canvas) {
  const ratio = pixelRatio()
  const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight
  canvas.width = Math.round(w * ratio)
  canvas.height = Math.round(h * ratio)
  return { w, h, ratio, phone: isPhone() }
}
