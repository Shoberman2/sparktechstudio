import { useEffect } from 'react'

// Runs draw(ctx, w, h, t, pointer) on a DPR-sharp canvas. Pauses off-screen and in hidden tabs; one still frame under reduced motion.
export function useLoop(ref, setup, { gl = false } = {}) {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gl ? canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false }) : canvas.getContext('2d')
    if (!ctx) return
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const draw = setup(ctx, canvas)
    let w = 0, h = 0, raf = 0, visible = true, start = performance.now()
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      if (!gl) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (still || !visible) frame(performance.now(), true)
    }
    const frame = (now, once) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06
      draw(w, h, still ? 8 : (now - start) / 1000, pointer, canvas)
      if (!once && !still && visible && !document.hidden) raf = requestAnimationFrame(t => frame(t))
    }
    const move = e => { const r = canvas.getBoundingClientRect(); pointer.tx = (e.clientX - r.left) / r.width; pointer.ty = (e.clientY - r.top) / r.height }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(t => frame(t)) })
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden && visible) raf = requestAnimationFrame(t => frame(t)) }
    const ro = new ResizeObserver(size)
    // Start once the first paint is done and the main thread is free, so the canvas never competes with the page's own render
    const begin = () => {
      ro.observe(canvas); io.observe(canvas)
      addEventListener('pointermove', move, { passive: true })
      document.addEventListener('visibilitychange', vis)
      size()
    }
    const idle = window.requestIdleCallback ? requestIdleCallback(begin, { timeout: 600 }) : setTimeout(begin, 200)
    return () => { (window.cancelIdleCallback || clearTimeout)(idle); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', vis) }
  }, [ref, setup, gl])
}
